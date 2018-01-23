twitch-hud
==========

> Custom Twitch HUD for @kitajchuk.



### What this is

This is a custom webapp architecture designed so I can build an iterative and interactive Twitch HUD for my [#kitajchuk](http://twitch.tv/kitajchuk) channel. It's 100% custom coded by myself — built upon the bountiful open-source code found on the [npm registry](https://www.npmjs.com), of course.

#### Synopsis of the HUD
The name of the game is "**Kita** wants to Stream!". However, **Kita** only has 18 hearts and every 10 minutes **Kita** loses 1 heart. That only gives **Kita** 3 hours to stream. But here's the BIG "However": You folks can help **Kita** stream as long as he wants. If you want to punish **Kita** whenever he makes mistakes in Photoshop you can use the `!ht` ( Heart Thief ) command to strike a heart from the life meter.

There are 15 fairies that need to be found. Random intervals of no more than 10 minutes will cycle fairy activity on and off. Using the `!ff` ( Fairy Finder ) command you can attempt to catch a fairy with an accuracy of 25%. If you try to catch a fairy during a time of no activity, you simply fail to catch a fairy 100% of the time since there are none. By catching fairies you work towards the goal of finding all 15 fairies.

Here's the catch. We want to find all the fairies, but we also want **Kita** to continue streaming. So if **Kita** is running low on hearts, we have to spend fairies to recover some heart containers using the `!fb` ( Fairy Bottle ) command. Every fairy spent takes a fairy away from our set of 15 we are working towards. So a fine balance must be struck in order to ensure that **Kita** can stream as long as he needs. When **Kita** runs out of hearts, the stream ends — Game Over.



### Twitch HUD commands

* `!ht`: Heart Thief: Steal a heart from Kita.
* `!ff`: Fairy Finder: Attempt to catch a fairy.
* `!fb`: Fairy's Bottle: Recover a heart for Kita.



### Twitch API resources

* [New Twitch API](https://dev.twitch.tv/docs/api)
* [Kraken V5 API](https://dev.twitch.tv/docs/v5)
* [TMI Client](https://www.tmijs.org)
