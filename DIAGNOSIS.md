# CI Failure Diagnosis

## Evidence available

The baseline branch was pushed before code changes. The public Actions page showed **0 workflow runs**. The push filter was `'*'`, which does not match the slash in `fix/ci-pipeline-recovery`, so that push never triggered the workflow. The errors below are from the local baseline Jest run, and the remaining workflow findings are based on the checked-in YAML and package files. Hosted log messages are not inferred or fabricated.

## 1. Discount assertion

- **Step:** Local Jest, `src/payments/calculateDiscount.test.js`, test `applies 10 percent discount correctly`.
- **Exact error:** `Expected: 100` / `Received: 90`.
- **Cause:** The test expected the original price even though applying a 10% discount to 100 correctly returns 90. The function is correct; the test expectation was wrong.

## 2. Currency object matcher

- **Step:** Local Jest, `src/utils/formatCurrency.test.js`, test `formats currency correctly`.
- **Exact error:** `If it should pass with deep equality, replace "toBe" with "toStrictEqual"` and `Received: serializes to the same string`.
- **Cause:** `toBe` checks object identity, but `formatCurrency` returns a separate object with the expected fields. The test needs a deep-equality matcher such as `toEqual`.

## 3. Lint has no configuration

- **Step:** Local `npm run lint` (the repository's lint script).
- **Exact error:** `ESLint couldn't find a configuration file.`
- **Cause:** ESLint was listed as a development dependency and a lint script existed, but no ESLint configuration was committed. A minimal config now enables the Node.js and Jest globals and recommended ESLint rules.

## 4. Test job has no checkout or dependencies

- **Step:** GitHub Actions workflow job `test`, step `Run tests`.
- **Exact error:** No hosted error message is available because the baseline push produced no visible workflow run.
- **Cause:** The job ran `npm test` without checking out the repository or installing packages. GitHub-hosted jobs receive separate runners, so dependencies installed by the `install` job are not present in `test`.

## 5. Install job ordering and lockfile

- **Step:** Workflow job `install`, step `Install dependencies`.
- **Exact error:** No hosted error message is available because there was no visible baseline workflow run.
- **Cause:** The test job had no `needs: install` dependency, so it could start in parallel. The workflow used `npm install`, and the original lockfile did not include the declared `lodash` package. The lockfile was regenerated and the workflow now uses `npm ci` for reproducible installs.

## 6. Push filter skipped the recovery branch

- **Step:** Workflow trigger, `push` event.
- **Exact error:** No step error was emitted; GitHub showed no workflow run for the baseline branch push.
- **Cause:** The branch filter `'*'` did not match the slash-containing branch name `fix/ci-pipeline-recovery`. It now uses `'**'` so nested branch names trigger CI.
