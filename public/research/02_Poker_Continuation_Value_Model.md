# From a binomial option tree to poker continuation value

**Scope.** Heads-up postflop poker with chip-linear utility, finite stacks, no rake, and a finite set of legal bet sizes. Start from a specified flop pot, stacks, positions and ranges. There are two separate questions. Given an opponent policy, what is the best action? If both players can choose their policies, what strategies form an equilibrium?

## 1. What carries over from options

For a CRR American option with exercise payoff $g_t(S)$, the one-step rollback is

```text
q = (exp(r Δt) − d) / (u − d)
V_t(S) = max(g_t(S), exp(−r Δt) · [q V_{t+1}(uS) + (1−q) V_{t+1}(dS)])
```

Here $u,d$ are stock price multipliers, $r$ is the continuously compounded risk-free rate, and the standard no-arbitrage setting requires $d < exp(r Δt) < u$. The risk-neutral weight $q$ comes from replication. In poker, the transferable idea is comparing an immediate stop with continuation after rolling back future states. A call pays a cost to preserve eligibility for the pot and may preserve later choices. A fold relinquishes the claim and avoids further outlays. Physical card probabilities and a model of the opponent's betting generate branch probabilities. The hand has no assumed tradable replicating portfolio and no risk-free discounting between streets. [CRR](https://doi.org/10.1016/0304-405X(79)90015-1) · [Kifer](https://doi.org/10.1007/PL00013527)

| Option tree concept | Poker implementation |
|---|---|
| Underlying state | Board, betting history, actor, pot, commitments, effective stacks, and a distribution over compatible private hands. |
| Up or down move | Exact card reveal in the reference model. A good/bad split is an optional compression whose quality must be measured. |
| Early exercise comparison | Compare fold, call and raise when legal, or check and bet when no amount is owed. Each action has a continuation value. |
| Pricing probability | Deal probabilities from the deck, conditional on known cards, plus action probabilities from the opponent policy. |
| Recombining lattice | Merge histories only when the retained state is sufficient for the future payoffs, legal actions, and transition law. Equal showdown equity alone is insufficient. |
| Expiry payoff | Pot award at showdown or fold, net of contributions. After an all-in and call, remaining cards resolve by chance alone. |

If all private cards are known and dealing is uniform, reversing the order of two public cards gives the same terminal board. With betting between those cards, the two paths can produce different pots, ranges and commitments. With a fixed payoff and forced showdown, conditional expected payoff obeys iterated expectations. This property requires no risk-neutral change of measure.

## 2. The range-aware reference model

Let $h$ be a full history and $s$ a public history. Player $i$'s information set $I_i$ contains histories compatible with their public observations and own hole cards. A strategy maps $I_i$ to probabilities on legal actions. For a policy profile, keep a joint conditional distribution $b_s(x_0,x_1)$ on compatible hole-card pairs. A player's private belief is obtained by conditioning this joint distribution on their own hand. A starting joint range can be built by specifying combo weights, zeroing collisions and normalizing. State this as a modeling assumption and preserve the resulting dependence.

For an opponent with fixed policy $π_o$, a hero who holds $x$ updates a villain range $b(y)$ after observing action $a$. For the next public card $c$, the probability of dealing it given the hands and history comes from the compatible deck.

```text
Pr(a | x,s) = Σ_y b(y) π_o(a | y,s)
b_a(y) = b(y) π_o(a | y,s) / Pr(a | x,s)

Pr(c | x,s) = Σ_y b(y) p(c | x,y,s)
b_c(y) = b(y) p(c | x,y,s) / Pr(c | x,s)
```

Each line uses the belief at that node, so a card after a bet uses the action-updated range. Use zero probability for a card blocked by either hand or the board. With two full hands fixed and no other revealed dead cards, each compatible turn has probability $1/45$ after the flop and each compatible river $1/44$ after the turn. Marginalized probabilities can vary by card with a nonuniform opponent range. Skip unreachable branches in fixed-policy evaluation, and handle the supports needed for deviations when solving or evaluating a strategic profile. Keep the deck transition and action likelihood as separate functions. [Bayes’ Bluff](https://arxiv.org/abs/1207.1411) · [ReBeL §4](https://arxiv.org/abs/2007.13544)

### Payoff conventions

For an absolute payoff, track total contributions $C_i$ from both players, including the amounts assigned to them in the starting pot. At a terminal node, subtract player $i$’s contributions from their pot award. At showdown split ties by the stated rules. A fold awards the pot to the other player. For an incremental value at a root, add back the hero’s root contribution $C_i^{root}$ so folding immediately is worth zero when fold is legal. In a recursive **incremental** implementation, subtract each future hero payment exactly once, and carry the full pot award at the terminal. In an **absolute** implementation, subtract contributions at the terminal and do not subtract those same payments on edges.

On the river with no raise and no future action, let $P$ be the pot **after the opposing bet and before the hero calls**, $C$ the call cost, and $e$ the win probability plus half the tie probability, conditional on the betting range. Then

```text
EV(fold) = 0
EV(call) = e(P + C) − C
Break-even equity = C/(P + C)
```

When the opponent bets 75 into a pot of 100, the call costs 75 and the final pot is 250. Break-even equity is 30%. This is a conditional expectation under the opponent’s betting range. The opponent’s bet conveys information about that range.

## 3. Two distinct rollbacks

**Fixed opponent.** Solve a finite-horizon belief-state best response. In an absolute-payoff implementation, recurse with terminal utility at leaves, sum child values at card deals and fixed-policy opponent nodes, and maximize over legal actions at each hero information state. The opponent policy must specify responses to all histories the hero may reach by deviating. At a hero decision, compute each action value using one common action across the compatible hidden histories. Maximizing separately in each hidden state gives an infeasible clairvoyant strategy.

**Strategic opponent.** Solve the extensive-form game. Choose complete behavioral strategies over information sets, with the opponent optimizing as well. For a small perfect-recall zero-sum tree, use sequence-form linear programming or CFR with evaluation of the reach-weighted average strategy. Hidden cards couple choices across histories, so running a local max/min at each hidden state or independently solving every river with fresh ranges does not implement a Nash solve. A later-street subtree can depend on opponent counterfactual values from the earlier solution. [Sequence form](https://doi.org/10.1006/game.1996.0050) · [CFR](https://proceedings.neurips.cc/paper/2007/file/08d98638c6fcd194a4b1e6992063e944-Paper.pdf) · [Decomposition](https://doi.org/10.1609/aaai.v28i1.8810) · [DeepStack](https://arxiv.org/abs/1701.01724)

A compact equilibrium fixture separates betting from card odds. In a polarized river toy game, the bettor's value hand always beats the bluff catcher and the bettor's bluff always loses at showdown. A check goes straight to showdown. Let $P_0$ be the pre-bet pot and $B$ the single permitted bet. An interior equilibrium where value always bets has:

```text
Bluff share among bets = B/(P_0 + 2B)
Bluff-to-value ratio  = B/(P_0 + B)
Defender calls         = P_0/(P_0 + B)
```

At $P_0=100, B=75$, these are $3/10$, $3/7$, and $4/7$. With an ex-ante 50/50 value and bluff mixture, bluff hands bet with probability $3/7$. The defender is indifferent between call and fold, and the bluff is indifferent between betting and checking. This assumes a sufficient supply of bluff combos and the stated payoffs.

## 4. Worked flop → turn → river example

All probabilities are synthetic, the opponent bets as specified on every reachable branch, and the hero may only call or fold. Units are chips. Start with 10 in the pot on the flop, facing a bet of 2. Calling makes the pot 14. On the turn the opponent bets 6, and a turn call makes the pot 26. On the river the opponent bets 10, so a river call makes the pot 46.

A turn signal is strong with probability $1/4$, weak otherwise. The probability of a favorable river signal is $0.75$ after a strong turn and $0.15$ after a weak turn. Showdown equity conditional on a favorable river is $0.75$, and on an unfavorable river $0.10$, for either turn branch.

| Decision | Call EV relative to folding there | Choice |
|---|---:|---|
| Favorable river | 0.75 · 46 − 10 = 24.5 | Call |
| Unfavorable river | 0.10 · 46 − 10 = −5.4 | Fold |
| Strong turn | −6 + 0.75 · 24.5 = 12.375 | Call |
| Weak turn | −6 + 0.15 · 24.5 = −2.325 | Fold |
| Flop | −2 + 0.25 · 12.375 = 1.09375 | Call |

For the same flop call and unchanged opponent, forcing future calls on both streets gives **−4.43**. Allowing a fold only on the turn gives **0.75625**. Allowing a fold only on the river gives **−0.65**. Allowing folds on both gives **1.09375**. These are conditional values of taking the flop call. An optimized flop decision would fold when the listed value is negative. The gaps measure flexibility relative to a specified rule for future decisions, and depend on the opponent policy and reference commitment. The turn and river contributions need not add when measured separately against the forced-call case.

## 5. What a binary tree can miss

For a one-step stop with fold payoff zero and continuation value $X$ revealed before choosing, E[max(0,X)] ≥ max(0,E[X]). The difference is positive when both positive and negative continuations have positive probability. The same mean continuation can therefore have different value. In real postflop poker, the relevant $X$ also depends on future betting, stack depth and changing ranges. A two-branch model can preserve the positive/negative split at one stop under an exact within-branch mean calculation and still fail earlier in the game where multiple actions compete. The experiment should test decision EV and distribution retention, rather than assuming that a close equity estimate preserves decisions. [Distribution-aware abstraction study](https://poker.cs.ualberta.ca/publications/AAMAS13-abstraction.pdf)
