---
layout: post
title: >-
  A/B-testing software telemetry consent prompts while strictly honoring the
  user's privacy using Bayes' theorem!
date: '2016-11-09 21:04'
---

## Overview

This essay is meant as a first test of [`Jekyll`](https://jekyllrb.com) and [`Markdown syntax`](https://daringfireball.net/projects/markdown/), as well as a small inquisition into how a description of a procedure can be _mined_ for information that is implicitly extractable, thus tightening the bounds of our estimate on its contained information.

Software should present a user with a _choice_ before initiating telemetry – or transmitting any kind of usage data. A powerful tool is [A/B testing][ABtest], it is used to determine which presentation of a form or prompt to a user yields the most successful response (in terms of purchased products, subscriptions, installed toolbars, …). One might combine the two, but in order to adhere to the above principle of not transmitting the usage data without consent, how do we obtain a (weaker) statistic if we get notified of the user's choice only in the event of a positive answer, consenting to telemetry? Bayes' theorem gives an answer.

## Telemetry in Software
Nvidia recently stealthily added a call home component to their driver (see e. g. [this discussion on Hackernews][HNLink]), swiftly leading to a cry of outrage.

### Ways of prompting for user consent to telemetry

It seems clear that a piece of software should leave the decision to take part in telemetrical survey to the user. But how to do it best? There are several possibilities, e. g.

* **opt-in** via a checkbox that is _unchecked by default_,
* **opt-out** via a checkbox that is _checked by default_,
* **non-defaultable** choice via two buttons corresponding to 'yes' and 'no' of which _one has to be clicked_,
* or any other way of presenting a choice.

### Ethics vs. metrics

It might be hard to determine which of these methods is ethically optimal: should one go for the opt-out method for higher consent numbers among lazy users that always go with the default settings disregarding privacy concerns? This however might overly influence a privacy-concerned user to flatly reject the prompt because of its assertiveness. How much influence by preselection should be allowed to be put on the user?

The above question seems hard to answer; a purely quantification based approach of just measuring the effectiveness of each approach is perhaps also more interesting to the publisher of the software.

The only ethical demand we're putting on such a selection form is that no user data is transfered back to the software's server without consent. This will allow for _a more honest approach to telemetry than in the case of Nvidia_, and through some probabilistical trickery, we can still obtain meaningful statistics on the success rate of each type of alternative presentation of the choice.

## A/B testing effectiveness of telemetry consent requests

At the corresponding stage of the installation process or during usage of the software, the user would be presented with a telemetry consent form chosen at random from a set of alternatives A/B(/C/…) that are to be tested for their effectiveness.

### Naive way

In the basic case, after the user made his choice on whether or not to allow telemetry, his answer gets sent directly back to the server. Of course, this violates above principle of not sending anything without consent, and in the case of a negative choice we even have _explicit non-consent_.

### Bayes way

Based on some assumptions we can do with less, and still follow the privacy principle and get the relevant statistical data.

We observe that the quantity we are interested in is the probability that a user will accept telemetry, given each form alternative that has been presented to him. Denoting the chosen form alternative by the variable $$ F \in \{A,B,…\} $$, and the outcome of accepting telemetry by the variable $$ T\in \{0,1\} $$, the acceptance rate for telemetry is the conditional probability $$P(T\vert F)$$.

Since we do not receive data from the user in the case $$T=0$$ of non-consent, we cant calculate this probability by $$P(T=1\vert F) \approx \frac{\text{#consented to F}}{\text{#consented to F} + \text{#non-consented to F}}$$.

We can use Bayes' Formula relating conditional probabilities, $$P(A\vert B) = P(B\vert A)\frac{P(A)}{P(B)}$$. Applied to our problem it takes the form

$$P(T=1\vert F) = P(F\vert T=1)\frac{P(T=1)}{P(F)},$$

that is, the probability of consent upon being presented a specific form is equal to a term consisting of

*  $$ P(F\vert T=1) $$: The probability of a form given that the user consented to telemetry. We have this information!
*  $$ P(F)$$: We know this, since we programmed the frequencies with which each A/B alternative appears into the software
*  $$P(T=1)$$: The total ratio of a consenting answer. We don't know this.

If a count of installations is in some way available, we can estimate the quantity $$P(T=1)$$ by counting $$\frac{\text{#responses}}{\text{#installations}}$$.
If that's not the case, then we can still get a __relative ranking__ of the different options by noting the proportional relationship (because $$P(T=1)$$ does not depend on $$F$$)

$$P(T=1\vert F) \sim \frac{P(F\vert T=1)}{P(F)}.$$

## Conclusions

Even if negative responses are not recorded, we can still recover the distribution of success rates, up to a factor. In order to infer _relative persuasiveness_ of the different alternatives, this is adequate. Note, however, that since these are only relative quantities, two different A/B tests yielding relative values can not be combined into a joint result (since the factors $$P(T=1)$$ might differ in the two experiments). This can be helped by introducing a _control_ that stays the same in both experiments, trading a little redundancy or rather a decrease in information gained for the ability to merge the two results (using the assumption that this control has the same rate of success in both cases).

Does extracting this information make one of the facets of the privacy principle meaningless by revealing information about the user that is meant to be protected by the privacy principle? No, the privacy is maintained and still conceals the information of non-consent. If a user non-consents, then this information stays unrecorded and hidden. It only influences the factor $$P(T=1)$$ by decreasing it, which is unknown to the recipient of the telemetry.

A case that is problematic insofar that the (possibly sensitive) information of non-consenting is recoverable is the situation that to each user of the software is associated a user account. In this case his 'consentiveness' can be inferred via exclusion.

[ABtest]: https://en.wikipedia.org/wiki/A/B_testing
[HNLink]: https://news.ycombinator.com/item?id=12884762
