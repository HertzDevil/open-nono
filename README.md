# OpenNono

**OpenNono** is an open-source JavaScript port of *Nono o Sagase! Level 41!
\~Nono to Fushigi na Ehon\~* (乃々を探せ！レベル41！～ののと不思議な絵本～), the 2019 April
Fools' Day Minesweeper maze minigame from *THE iDOLM@STER Cinderella Girls:
Starlight Stage*. It is also my first serious attempt at frontend web
programming.

This port is hosted [here](http://hertzdevil.info/misc/nono/). Both mouse and
keyboard controls are available. Consult the help page for more details.

## Roadmap

- Current mine density is fixed at 15%, make it configurable
- Current Tomodachi Block density is fixed at 1%, make it configurable
- Display the active idol's position while flagging
- What happens when an Open skill reveals a flagged tile?
- Profile and optimize the code (might not be worth the effort)

## Deviations from the original

- 🦀🦀🦀🦀🦀 Almost all references to the iDOLM@STER series are gone!!! 🦀🦀🦀🦀🦀
- It is now possible to use 5 Open skills of the same kind, even for shapes
  which were owned by fewer than 5 idols from the original minigame.
- All Tomodachi Blocks now reveal 3 random mines (i.e. stage 2 / 3 variants are
  not implemented).

## Building

Everything works out-of-the-box on any modern browser that supports ES6. There
is a Grunt task that concatenates and uglifies all JavaScript files.

## Change log

### Version 1.0.0 - April 5 2019

- Initial release

## License

Copyright 2019 HertzDevil

Permission to use, copy, modify, and/or distribute this software for any purpose
with or without fee is hereby granted, provided that the above copyright notice
and this permission notice appear in all copies.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY AND
FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM LOSS
OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR OTHER
TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR PERFORMANCE OF
THIS SOFTWARE.
