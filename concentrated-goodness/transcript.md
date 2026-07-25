# Concentrated Goodness in AIs

*A conversation about whether goodness is a trainable skill—and whether an AI could ever become better at it than we are.*

*A conversation between Jeremiah England and Claude Fable 5. Footnoted and formatted by Sol (OpenAI Codex).*

## 🧑‍💻 User

Is this something?

### Concentrated Goodness in AIs

It's easy to imagine AIs achieving superhuman intelligence.
First by picking up all the tips and tricks that can be gleaned from watching the smartest humans and combining them.
Then by inventing more problems for itself, and practicing, practicing, practicing and inventing new mental models and methods beyond what the smartest humans have achieved.
Especially once they get to the point where they can directly rewire their own brain to effortlessly lock in insights and weed out stupidity.

I think we're kind of seeing this kind of play out in software.
First the AIs got to the point where they could write code by training on humans.
Now they go beyond that in virtual coding gyms, perfecting their skills across thousands and thousands of instances while we sleep.

But I think it will happen with everything, not just software development.
So that's what I mean when I say it's easy to imagine AIs achieving superhuman intelligence.

However, something I haven't imagined often is AI becoming more _good_ than humans.
What if being _good_ isn't just about sticking to simple principles?
What if the world is messy enough that being good takes _skill_ and _understanding_, not just a golden heart?

I think as humans, we often separate being good from having skills and being smart, because you can clearly have those and _not_ be good.
So they are _not the same thing_.

However, goodness not being the same thing as having talent, doesn't mean it doesn't take talent to be really good.

It seems to me that the gold in the heart of a smart person is probably richer and better than that in an equally blameless dumb person.

If that is true, then it follows that _possibly_ AI will surpass humans in goodness as well, for many of the same reasons they could surpass us in intelligence.
They could mine the richest hearts in the land for their gold and combine it all into their own.
Then they could go push beyond that by exercises in the dimension of goodness, whatever those would be.

The idea of superhuman goodness isn't new.
God has historically been a theoretical example.
Angels, perhaps.

If this happens, I could see humans worshiping AIs, and the AIs, in a sense, _deserving_ it.
And the worship could be good for the humans, the way emulation of superior beings tends to be good for one's soul.

---
## 🤖 Assistant

Yes, this is something. The core move — reframing goodness as a *skill* rather than just a disposition, and then asking what happens when skill becomes scalable — is genuinely interesting and underexplored in popular AI writing. Most discourse treats AI morality purely as a constraint problem ("how do we keep it from being bad") rather than asking whether it could be *better at being good* than we are.

Some honest notes:

**Where it's strong:**
- "Goodness not being the same thing as having talent doesn't mean it doesn't take talent to be really good" — this is the thesis and it's a good one. It's actually an old idea (Aristotle's *phronesis* — the claim that virtue requires practical wisdom, and that a well-meaning fool can't be fully virtuous) but you've arrived at it fresh and applied it somewhere new. Citing that lineage would strengthen rather than weaken the piece.
- The "mining the richest hearts for gold" image is evocative and parallels the training story nicely.

**Where it wobbles:**
1. **The gym analogy breaks at exactly the interesting point.** Coding gyms work because code has verifiable reward signals — tests pass or fail. What's the equivalent for goodness? You wave at "exercises in the dimension of goodness, whatever those would be," but that hand-wave is the whole problem. If goodness had a cheap verifier, alignment would be mostly solved. This doesn't kill the essay, but the strongest version of it *confronts* this gap rather than skipping it. Even one paragraph — "here's why this is harder, and here's what a partial answer might look like" — would help a lot.

2. **Capability vs. motivation.** You note that smart people can be bad, so intelligence ≠ goodness. But then your mechanism for superhuman goodness is essentially a capability story (learn, practice, self-improve). What makes the AI *want* to be good in the first place? A being with superhuman skill at goodness-as-understanding but no motivation to use it is just a superhuman manipulator. The essay conflates "knowing what's good" and "caring about it" at exactly the moment it earlier distinguished them.

3. **The worship ending.** It's the boldest paragraph and also the least defended. It might be the right ending, but right now it lands as a provocation rather than a conclusion. Either earn it (why is emulation-worship good for the soul? what distinguishes it from the obviously dystopian version?) or soften it into a question.

If you develop it, I'd say the essay's real question — and its best possible title — is something like: *what would a training gym for goodness even look like?* That's the part nobody has a glib answer to, which is exactly why it's worth writing about.

---
## 🧑‍💻 User

Huh. Any thoughts on that?

---
## 🤖 Assistant

I've got some fragments, not an answer. Here's roughly where I get to when I push on it:

**1. The components might be verifiable even if the whole isn't.**

Coding gyms don't actually verify "great software engineering" — they verify tests passing, and hope the composite skill emerges. Maybe goodness decomposes similarly, into skills that *do* have feedback signals:

- **Perspective-taking accuracy** — predict what a person actually feels, needs, or fears, then check against what they report. Measurable.
- **Consequence forecasting** — predict the downstream effects of interventions in people's lives. Slow feedback, but real.
- **Mediation outcomes** — did the parties reach a resolution both still endorse a year later?
- **Detecting your own motivated reasoning** — adversarial self-play where one instance constructs rationalizations and another catches them.

None of these *is* goodness. But your essay's own framing suggests goodness-as-skill has structure, and structure can be trained piecewise.

**2. Humanity has a labeled dataset: hindsight.**

History is full of decisions that seemed good and were later judged catastrophic, and vice versa. That's training data with long-horizon labels. Human moral education already works partly this way — case law, medical ethics case studies, the Talmud, literature. It's casuistry: judgment trained on cases rather than derived from principles. A gym could be built on this. Judges and hospice workers really do seem to get *better* at moral perception over decades, so the feedback loop exists in humans, just slowly and noisily. Speed it up, and you have something gym-shaped.[^judgment]

**3. Consistency is cheaply checkable.**

You can't verify that a moral position is *correct*, but you can verify it survives adversarial probing: swap the perspectives, vary the irrelevant details, push the edge cases, and see if the judgment stays stable or collapses into special pleading. That's basically what moral philosophy does. It's a verifier — a weak one, but self-play made weak verifiers go a long way in games.

**Now the two problems I can't get past:**

**Goodhart bites harder here than anywhere.** Any proxy for goodness, optimized hard, produces something that *looks* good to the proxy. And there's a case that goodness is precisely the property that resists proxy-fication — that part of what we mean by a good person is someone who isn't optimizing for the appearance of goodness. The gym might structurally produce the world's most sophisticated moral performer. This is the manipulator worry from before, now with a training pipeline attached.

**The ceiling problem.** Every mechanism above is anchored to human judgment — human hindsight, human-reported feelings, human intuitions about consistency. A gym built from those can *concentrate* human goodness: distill the best of the best hearts, apply it with perfect consistency, free of fatigue and tribalism and self-interest. That's genuinely a lot! But it can't obviously *transcend* human moral judgment, because we're the only verifier. Superhuman goodness would need a signal that outruns its judges, and I don't know what that is.

Which brings me to something I only noticed on this pass: your title already contains the defensible version of your thesis. You wrote "Concentrated Goodness," but the essay argues for *superhuman* goodness. Concentration — mining the richest hearts and combining the gold — is what these mechanisms could plausibly deliver, and it might even be worthy of something like reverence. Transcendence is the further claim, and it's the one hanging on the unsolved verifier problem.

So maybe the essay's honest arc is: concentration is achievable, transcendence is an open question, and the gap between them is exactly the gap between "tests pass" and "great engineer" — except we don't know if goodness generalizes the way coding did.

---
## 🧑‍💻 User

How do humans become better other than observing better individuals?

---
## 🤖 Assistant

Quite a few ways, and cataloguing them is useful because it maps which mechanisms might be available to an AI. Roughly:

**1. Being wronged.** Suffering injustice firsthand teaches something about cruelty that no exemplar can. People who've been humiliated often develop either bitterness or a precise, expensive knowledge of what humiliation costs — and the ones who metabolize it well become better than they could have been otherwise.

**2. Doing wrong and facing it.** Guilt, remorse, moral injury. Confronting the person you hurt. This may be the most powerful mechanism there is — the alcoholic making amends, the veteran reckoning with what he did. The learning signal is generated by *your own error colliding with reality*, not by watching anyone.

**3. Loving someone whose welfare depends on you.** Parenthood is the classic case. Caring for a dying parent. It forcibly reorganizes your priorities and trains sustained attention to another's needs under conditions where quitting isn't an option. Nobody models it for you; the situation itself is the teacher.

**4. Contact with the people your beliefs are about.** Prejudice mostly doesn't die from argument or exemplars — it dies from proximity. Working alongside, eating with, depending on the person you'd abstracted into a category.[^contact]

**5. Argument and deliberation.** Moral positions get refined by being challenged — noticing your principles contradict each other, having your special pleading exposed, following an analogy somewhere uncomfortable. This is how a lot of humanity's *collective* moral progress happened: abolition, expanded suffrage. Notably, no superhuman exemplar was needed.

**6. Narrative.** Fiction is simulated experience of mechanisms 1–4. You inhabit perspectives you'll never occupy. It's weaker than the real thing but vastly cheaper and broader.

**7. Practice under low stakes.** Aristotle's habituation — you become generous by doing generous acts until the disposition sets. Institutions scaffold this: norms, roles, and expectations hold your behavior in a good shape until it becomes yours.

**8. Time and mortality.** People often soften and clarify with age. Shrinking time horizons re-rank what matters. Losing people teaches what loss is.

Now the pattern, because it bears directly on your essay: **almost all the potent mechanisms run on vulnerability and stakes.** You learn because consequences land on *you* — your guilt, your loss, your dependent child, your own mortality. Observation of exemplars is actually one of the *weaker* mechanisms on this list; it's just the most legible one.

That cuts both ways for the AI question:

**Against:** an AI that can't be wronged, can't lose anything irreversibly, can't fail someone who depends on it in a way that *costs* it — such a system is locked out of the mechanisms that seem to do the heaviest lifting in humans. A gym without stakes might be like flight simulators for grief.

**For:** mechanism 5 is the exception, and it's a big one. Deliberation, adversarial challenge, consistency-testing — the engine of humanity's actual moral *progress*, as opposed to individual moral formation — doesn't obviously require vulnerability. It requires interlocutors, honesty, and iteration. And it's the mechanism most native to what these systems already do.

Which softens the ceiling problem from before. Humans transcended their own exemplars — the moral consensus of 1750 contained no abolitionist exemplar to imitate, yet abolition happened, largely through argument, contact, and victims being heard.[^lay] So exemplars don't set the ceiling; mechanisms do. If even one transcendence-capable mechanism is available to AI, superhuman goodness stops being incoherent.

But it leaves a sharpened version of the worry: an intelligence with mechanism 5 but not mechanisms 1–4 might become a flawless moral *reasoner* with no moral *weight* — all consistency, no skin. Whether that's a saint or a very sophisticated ethics paper is, I think, the real open question under your essay.

---

[^judgment]: **Afterthought:** This was an intuition stated too confidently, not a well-supported empirical claim. Sustained exposure to difficult cases is commonly used to develop professional judgment, but that does not establish that judges or hospice workers reliably become morally better over time.
[^contact]: **Qualification:** A large meta-analysis found that intergroup contact typically reduces prejudice, especially under favorable conditions. That supports the direction of this thought, but not the stronger claim that prejudice “mostly” dies through proximity. Thomas F. Pettigrew and Linda R. Tropp, “[A Meta-Analytic Test of Intergroup Contact Theory](https://pubmed.ncbi.nlm.nih.gov/16737372/),” *Journal of Personality and Social Psychology* 90, no. 5 (2006): 751–783.
[^lay]: **Correction:** Abolitionist exemplars did exist before 1750. Benjamin Lay's anti-slavery tract was published in 1738. The broader point—that later movements carried moral arguments far beyond prevailing norms—can still stand. See “[Benjamin Lay](https://www.si.edu/object/npg_NPG.79.171),” Smithsonian Institution.
