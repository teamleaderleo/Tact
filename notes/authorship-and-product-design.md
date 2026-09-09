# Authorship and product design

Notes on the tension between artistic authorship, product responsibility, and the kinds of environments where strong taste can actually influence the whole thing.

## Art and product design answer to different masters

Art can be radically personal. The artist can decide the work needs twelve cats, three swords, a red sky, or a woman floating upside down because that is the work.

Product design has other claimants on the result:

- the user trying to accomplish something;
- existing interaction conventions;
- accessibility;
- engineering cost and platform behavior;
- brand and product history;
- maintenance and future states;
- business constraints;
- other people who must build, review, and live with the decision.

That does not drain product design of artistic opinion. It changes the test. Typography, density, spacing, motion, sound, color, material, omission, navigation, and interaction can all carry a strong authorial voice. The voice has to survive repeated use and still help the product do its job.

A useful distinction:

> Art may exist primarily to be experienced. Product design has a job to accomplish.

## Taste forced through reality

One appealing definition of product craft:

> Take taste, force it through every real constraint, and keep enough of it alive that the finished thing still feels deliberate.

The interesting skill is not merely detecting that something looks wrong. It is carrying the judgment through:

```text
this feels wrong
-> say exactly what is wrong
-> identify the user/job/state constraint
-> make materially different alternatives
-> use them repeatedly
-> preserve the one whose usefulness and character survive
```

The best result can be quiet:

> If you notice it, you love it. If you do not, you can just work.

## Authorship changes with the environment

Design jobs vary enormously in how much of the final product one person can author.

A mature company usually asks designers to steward an existing language. Even extremely senior people inherit product history, conventions, teams, strategy, and a visual identity larger than themselves. A designer at Apple still designs Apple; seniority does not turn macOS into unrestricted personal expression.

Large design organizations can also make the ordinary unit of work narrow: one flow, one component family, one feature, one state of a larger product. The work can be sophisticated while offering little end-to-end authorship.

Places with unusually high authorship tend to include:

- one's own product;
- very early startups;
- experimental internal products;
- personal tools;
- tiny teams where somebody genuinely owns an area;
- new product categories whose conventions are still being invented.

This is one reason an early product company can be unusually attractive: the visual and interaction language may still be young enough for one person to influence it deeply.

## The career fantasy and the actual craft

The romantic image of a design career is "I will design amazing things." A lot of professional design work is closer to "improve this real interaction inside a product with history, constraints, and users."

That is not a lesser craft. It is simply a different one from making art.

If unrestricted authorship is the goal, make art or make your own thing. If the goal is to create products people rely on and love, learn to enjoy the negotiation between taste and reality.

The ideal career may therefore mix both:

```text
product work -> taste tested against reality
personal work -> unrestricted authorship
```

Each can improve the other.

## Personality in interfaces

There is room for a lot more character in software than generic enterprise UI suggests.

Personality earns its place when it improves one or more of:

- orientation;
- memory;
- pleasure;
- identity;
- emotional tone;
- legibility of state;
- attachment to the product.

The hundredth-use test still applies. A delightful flourish that becomes irritating after two days has failed.

A useful Tact question:

> How much personality can an interface carry before the personality competes with the user's work?

## Dumb but excellent experiment: cats on macOS windows

Modern macOS does not expose a clean supported API for globally replacing every application's native titlebar chrome. A much saner experiment is to fake the visual effect with a small native overlay app:

```text
observe visible windows through Accessibility/CoreGraphics
-> track each window frame and state
-> create transparent borderless overlay windows
-> place ears/paws/tails/cats around the host window
-> keep overlays click-through
-> follow move/resize/minimize/Spaces/fullscreen
```

Possible behavior:

- cat ears on top corners;
- a tail hanging from one edge;
- a sleeping cat on inactive windows;
- focused windows wake the cat up;
- app-specific personalities;
- notification or task state reflected in the character;
- tasteful mode and completely deranged mode.

Avoid process injection/private-window-chrome hacks as the first implementation. An overlay can achieve most of the visual experiment while staying much easier to build and remove.

This is actually a useful design exercise rather than only a joke. It forces questions about motion, visual attachment, pointer behavior, occlusion, repetition, app identity, delight, and irritation.

## Questions worth chasing

- Where does strong authorial voice improve software?
- Which product categories can tolerate much more visual personality than current convention allows?
- What changes when the designer is also the engineer and can prototype directly in the real product?
- How quickly can artistic discrimination transfer into interaction and product judgment?
- Which details should disappear completely during use, and which should become beloved landmarks?
- What does genuine design ownership mean in a three-person company versus a 300-person design organization?
- Can a highly personal tool teach principles that survive translation into a general product?
- How do you preserve weirdness through the constraints without making the user pay for it?

The point of Tact is to answer these by making things, using them, and revising the opinion afterward.