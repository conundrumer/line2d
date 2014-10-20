Line2D
======
A minimal and parallel physics simulator using Typescript and (currently) only pure functions. Ideally, deterministic across all platforms. At the moment, it's not optimized at all. All entities get copied on each physics step. The API will probably change once I figure out a good balance of mutability and immutability...

Inspiration from Line Rider, Soda Constructor, and Phun/Algodoo.

Features
--------
- Only two types of entities: points and lines
- Verlet integration
- Parallel constraint solving
- Parallel collision resolution
- k-d tree space partitioning (which could also be parallel)
- Extensible impulse behavior and constraints
- (that is how you get springs and pistons and bounciness and friction and scriptable collision events and other fun stuff)

Usage
-----
It's UMD so load it however.

See declaration file for API.

See example.js for an example.

Algorithm
---------

1. Apply forces to points using globals and previous impulses
2. Iterate n times:
    1. Resolve constraints
    2. Resolve collisions while collecting impulses
