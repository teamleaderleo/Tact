#!/usr/bin/env python3
"""Existing layout owner roundtrip. Offline by default; --socket creates scratch work only."""
import argparse
import copy
import hashlib
import json
import posixpath
from pathlib import Path
import socket
import uuid
from urllib.parse import urlsplit


def portable(saved):
    """Allowlist a shell/browser/project template; refuse lossy or executable intent."""
    workspace = saved['workspace']
    if workspace.get('env'):
        raise ValueError('workspace environment requires explicit review; never export implicitly')
    def visit(node):
        if 'pane' in node:
            surfaces = []
            for row in node['pane']['surfaces']:
                if row.get('command') or row.get('env') or row.get('resume'):
                    raise ValueError('execution/resume intent needs typed owner metadata')
                kind = row['type']
                if kind not in ('terminal', 'browser', 'project'):
                    raise ValueError('unsupported surface kind')
                result = {'type':kind}
                for key in ('name','focus'):
                    if row.get(key) is not None: result[key] = row[key]
                if row.get('cwd'):
                    cwd = row['cwd']
                    if cwd.startswith(('/', '~')) or '..' in cwd.split('/'):
                        raise ValueError('cwd is outside portable project root')
                    result['cwd'] = posixpath.normpath(cwd)
                if row.get('url'):
                    url = row['url']; parsed = urlsplit(url)
                    if url != 'about:blank' and (parsed.scheme != 'https' or not parsed.hostname or parsed.username or parsed.password or parsed.query or parsed.fragment):
                        raise ValueError('URL is not an explicitly portable public destination')
                    result['url'] = url
                if kind == 'browser' and not result.get('url'): result['url'] = 'about:blank'
                if kind == 'project' and not result.get('cwd'):
                    raise ValueError('project surface requires portable cwd')
                surfaces.append(result)
            if not surfaces: raise ValueError('empty pane')
            return {'pane':{'surfaces':surfaces}}
        direction, ratio, children = node['direction'], node['split'], node['children']
        if direction not in ('horizontal','vertical') or isinstance(ratio,bool) or not isinstance(ratio,(int,float)) or not .1 <= ratio <= .9 or len(children) != 2:
            raise ValueError('unsupported split')
        return {'direction':direction,'split':ratio,'children':[visit(child) for child in children]}
    # No runtime IDs, session snapshots, process ancestry or environment crosses here.
    return {'workspace':{'cwd':'.','layout':visit(workspace['layout'])}}


def surfaces(node):
    if 'pane' in node: return node['pane']['surfaces']
    return [row for child in node['children'] for row in surfaces(child)]


def birth_records(template):
    """Template-local slots are positions, NOT durable CMUX identities."""
    return [{'version':1,'slot':index,'kind':row['type'],'cwd':row.get('cwd','.'),
             'intent':({'kind':'navigate','url':row['url']} if row['type']=='browser'
                       else {'kind':'open-project'} if row['type']=='project'
                       else {'kind':'shell'})}
            for index,row in enumerate(surfaces(template['workspace']['layout']))]


class SocketAPI:
    def __init__(self,path): self.path=path
    def call(self,method,params=None):
        request={'id':str(uuid.uuid4()),'method':method,'params':params or {}}
        with socket.socket(socket.AF_UNIX) as conn:
            conn.settimeout(30); conn.connect(self.path)
            conn.sendall((json.dumps(request)+'\n').encode())
            with conn.makefile('rb') as stream: raw=stream.readline(8*1024*1024)
        result=json.loads(raw)
        if result.get('id') != request['id']: raise RuntimeError('mismatched response id')
        if not result.get('ok'): raise RuntimeError(f'{method}: {result.get("error")}')
        return result['result']


def live_roundtrip(api, fixture, cwd):
    """Only exact IDs returned by this run can be closed; no existing layout overwrite."""
    token='tact-roundtrip-'+uuid.uuid4().hex
    created=[]; saved_names=[]; cleanup_errors=[]; result=None
    try:
        created.append(api.call('workspace.create',{'title':token,'cwd':cwd,'focus':False,
                                                   'layout':fixture['workspace']['layout']})['workspace_id'])
        def capture(workspace,name):
            saved=api.call('layout.save',{'name':name,'workspace_id':workspace,'overwrite':False})
            saved_names.append(name)
            if saved.get('unsupported_surface_count',0): raise ValueError('capture lost unsupported surfaces')
            return api.call('layout.get',{'name':name})
        first=portable(capture(created[0],token))
        listed=api.call('layout.list')
        if not any(x['name']==token for x in listed['layouts']): raise AssertionError('saved layout not listed')
        # Exercise existing open as well as portable JSON -> existing create.
        created.append(api.call('layout.open',{'name':token,'cwd':cwd,'focus':False})['workspace_id'])
        opened=portable(capture(created[1],token+'-open'))
        created.append(api.call('workspace.create',{'title':token+'-portable','cwd':cwd,'focus':False,
                       'layout':first['workspace']['layout']})['workspace_id'])
        recreated=portable(capture(created[2],token+'-recreated'))
        if first != opened or first != recreated: raise AssertionError('portable layout mismatch after recreation')
        if len(set(created)) != 3: raise AssertionError('recreation reused workspace identity')
        result={'mode':'live','status':'pass','template':first,'birth_records':birth_records(first),
                'evidence':{'workspace_instances':len(created),'surface_count':len(surfaces(first['workspace']['layout'])),
                            'layout_save_list_get_open_delete':True,'portable_create_recapture_equal':True}}
    finally:
        for name in reversed(saved_names):
            try: api.call('layout.delete',{'name':name})
            except Exception as error: cleanup_errors.append({'kind':'layout','target':name,'error':str(error)})
        for workspace in reversed(created):
            try: api.call('workspace.close',{'workspace_id':workspace})
            except Exception as error: cleanup_errors.append({'kind':'workspace','target':workspace,'error':str(error)})
        if cleanup_errors: raise RuntimeError('scratch cleanup incomplete: '+json.dumps(cleanup_errors))
    result['evidence']['scratch_cleanup']='complete'
    return result


def main():
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--fixture',type=Path,default=Path(__file__).with_name('layout.fixture.json'))
    parser.add_argument('--socket',help='opt-in live scratch workspace roundtrip')
    parser.add_argument('--cwd',help='required with --socket; existing project root')
    parser.add_argument('--output',type=Path)
    args=parser.parse_args()
    fixture=json.loads(args.fixture.read_text())
    template=portable(fixture)
    if args.socket:
        if not args.cwd or not Path(args.cwd).is_dir(): parser.error('--socket requires an existing --cwd')
        result=live_roundtrip(SocketAPI(args.socket),template,args.cwd)
    else:
        result={'mode':'fixture','status':'pass','template':template,'birth_records':birth_records(template)}
    result['template_sha256']=hashlib.sha256(json.dumps(result['template'],sort_keys=True,separators=(',',':')).encode()).hexdigest()
    output=json.dumps(result,indent=2)+'\n'
    if args.output: args.output.write_text(output)
    else: print(output,end='')

if __name__=='__main__': main()
