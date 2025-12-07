---
layout: page
title: Random Question
permalink: /random_question.html
---

## Random Question Generator

- [Questions That May Lead to Closeness](/random_question/index.html?set=love)
- [Life-Changing Questions](/random_question/index.html?set=life)
- [Truth or Dare](/random_question/index.html?set=truthdare)
- [Askhole](/random_question/index.html?set=askhole)
- [Computationally Kind Conversation Openers](/random_question/index.html?set=compkind)

You can link to these from NFC tags. Tapping will give you one question.

If your NFC tag supports injecting an internally incrementing tap counter into the URL, you can even link to the set with the additional GET param `idx` and have the question appear in pseudorandom, chunked order so that each question will not appear more than $$k + 1$$ times within any $$k * N$$ taps where $$N$$ is the number of questions in the set.

Also, if you choose the second method, refreshing the page will not simply give you a new question and you have to physically tap again to get the next question. This may make the experience feel more meaningful.
