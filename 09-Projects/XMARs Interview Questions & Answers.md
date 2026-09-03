# 🎯 XMARs Interview Questions & Answers

> **High-Yield Quick Revision & Mock Interview Cheat Sheet**  
> **Project**: XMARs (Extended Mutation Analysis and Resistance Scoring) — Precision oncology for NSCLC.  
> **My Contribution**: Mutation Analysis + Machine Learning Classification + SHAP Explainability.

---

## 30-Second Answer

XMARs is a precision-oncology project for NSCLC that analyzes molecular mutations and provides mutation classification, explainability, pathway analysis, and drug-related insights. My primary contribution was the Mutation Analysis, Machine Learning Classification, and SHAP Explainability subsystem. I worked with mutation features such as VAF and mutation consequences, trained Random Forest, Gradient Boosting, and AdaBoost models, combined them using soft voting, and used SHAP to explain predictions. Our documented soft-voting ensemble achieved 98.14% test accuracy with an F1 score of 0.9814.

---

## Complete Flow

```text
Patient mutation
      ↓
Feature construction
      ↓
Mutation Analyst Agent
      ↓
Random Forest + Gradient Boosting + AdaBoost
      ↓
Soft Voting
      ↓
Driver / Passenger prediction
      ↓
SHAP explanation
      ↓
Pathway Specialist Agent
      ↓
Drug-related analysis
```

> **Crucial Rule**: Do **not** say the Mutation Agent "gives paths." It produces mutation classification and SHAP information; pathway analysis is handled by the pathway component.

---

## VAF (Variant Allele Frequency)

**VAF = Variant Allele Frequency.**  
It is the fraction of sequencing reads supporting a particular variant.

### Example:
$$\frac{45 \text{ supporting reads}}{100 \text{ total reads}} = 0.45 = 45\%$$

### How to Say It in an Interview:
- **Say**: *"An EGFR variant with VAF 0.45 means 45% of the sequencing reads at that variant position support the variant."*
- **Do NOT say**: *"The EGFR gene is 45% mutated."*

> VAF is not automatically the percentage of tumor cells carrying a mutation; tumor purity, copy number, and other factors matter.

---

## Mutation Features

The documented model features include:
- `vaf`
- `vaf_high`
- `vaf_low`
- `coding`
- `cancer_predisposition_variant`
- `gene_mutation_count`
- One-hot mutation consequences such as `missense`, `frameshift`, `stop-gained`, `splice-region`, `synonymous`, and `in-frame deletion`.

---

## Random Forest

Random Forest is an ensemble of many Decision Trees.

```text
Input
 ├── Tree 1 → Driver
 ├── Tree 2 → Passenger
 ├── Tree 3 → Driver
 └── many more trees
          ↓
    Combined prediction
```

A single tree can overfit. Combining many trees generally improves generalization and reduces overfitting.

### Configuration
- `n_estimators=200`
- `max_depth=20`
- `min_samples_split=5`
- `min_samples_leaf=2`
- `class_weight='balanced_subsample'`

### Result
- **96.97% accuracy**

### Interview Answer
> *"Random Forest is an ensemble of multiple decision trees. A single decision tree can overfit the training data, while Random Forest combines predictions from many trees, which generally reduces overfitting and improves generalization."*

---

## Gradient Boosting

Gradient Boosting builds trees sequentially. Each new tree tries to reduce the existing ensemble's loss or errors.

```text
Data
 ↓
Tree 1
 ↓
Error / loss
 ↓
Tree 2 reduces it
 ↓
Remaining error
 ↓
Tree 3 reduces it
```

### Configuration
- `n_estimators=200`
- `learning_rate=0.1`
- `max_depth=7`
- `min_samples_split=5`
- `subsample=0.9`

### Result
- **98.09% accuracy**

### Interview Answer
> *"Gradient Boosting builds decision trees sequentially. Each new tree focuses on reducing the errors or loss made by the existing ensemble."*

---

## AdaBoost

**AdaBoost = Adaptive Boosting.**  
It builds weak learners sequentially and gives higher weights to samples that previous learners classified incorrectly.

```text
Learner 1
 ↓
Find mistakes
 ↓
Increase weights of wrong samples
 ↓
Learner 2 focuses more on them
 ↓
Repeat
```

### Configuration
- `n_estimators=100`
- `learning_rate=1.0`

### Result
- **96.78% accuracy**

### Interview Answer
> *"AdaBoost also builds weak learners sequentially, but it gives higher weights to samples that previous learners classified incorrectly, so subsequent learners focus more on difficult samples."*

---

## AdaBoost vs Gradient Boosting

### Easy Memory:
- **Gradient Boosting** $\rightarrow$ reduce error / loss
- **AdaBoost** $\rightarrow$ increase weight of wrong samples

### Interview Answer:
> *"AdaBoost adaptively changes the weights of misclassified samples, whereas Gradient Boosting fits subsequent trees to reduce the loss or residual errors of the existing model."*

---

## Soft Voting

Soft voting combines the predicted probabilities from RF, Gradient Boosting, and AdaBoost.

### Example:
```text
RF  → Driver probability 0.90
GB  → Driver probability 0.95
Ada → Driver probability 0.80

Average = (0.90 + 0.95 + 0.80) / 3 = 0.883 (88.3% Driver)
```

The class with the highest average probability is selected.

### Interview Answer:
> *"Soft voting averages the predicted class probabilities from multiple models and selects the class with the highest average probability."*

### Why Use It?
We combine the strengths of all three models instead of relying on only one. In our experiment, the ensemble achieved **98.14%**, slightly higher than Gradient Boosting at **98.09%**.

---

## Model Results

| Model | Accuracy |
| :--- | :---: |
| **Random Forest** | 96.97% |
| **Gradient Boosting** | 98.09% |
| **AdaBoost** | 96.78% |
| **Soft Voting Ensemble** | **98.14%** |
| **Soft Voting F1** | **0.9814** |

---
## Why Tree Models?

We chose tree-based ensemble models because our data is structured tabular mutation data with features such as VAF, coding consequences, and mutation counts. These models can capture nonlinear relationships and are suitable for our relatively small dataset. Interpretability is also important because we use SHAP to explain predictions.

---

## SHAP

**SHAP = SHapley Additive exPlanations.**  
It explains why a machine-learning model made a particular prediction.

```text
Mutation features
      ↓
ML model
      ↓
Prediction
      ↓
SHAP
      ↓
Why did the model make this prediction?
```

### Interview Answer:
> *"SHAP is an explainable AI technique based on Shapley values that explains how individual features contributed to a model prediction."*

### How SHAP Works:
- **Features** = players
- **Prediction** = team result

SHAP estimates each feature's contribution by considering its marginal contribution across different feature combinations.

### Example:
- `VAF` $\rightarrow$ `+0.20`
- `coding` $\rightarrow$ `+0.10`
- `frameshift` $\rightarrow$ `+0.25`
- `gene_mutation_count` $\rightarrow$ `-0.02`

Positive contribution pushes toward the positive class in the project's interpretation; negative pushes toward the other class; near-zero means little influence.

The project uses **TreeExplainer** for tree models and has a **KernelExplainer** fallback. A background/reference set of approximately **100 samples** is used.

---

## Feature Value vs SHAP Value

### Example:
- `VAF = 0.45`
- `SHAP(VAF) = +0.25`

- **Feature value** = actual input value.
- **SHAP value** = contribution of that feature to the prediction.

### Memory Anchor:
- **Feature value** = what the data says.
- **SHAP value** = how the feature influenced the model's decision.

> [!IMPORTANT]
> **Important**: SHAP explains a prediction; it does not prove that the prediction is correct.

---

## Driver / Passenger Rules

Documented project rules:
- `VAF >= 0.30 AND avg_SHAP > 0.01` $\rightarrow$ **`likely_driver`**
- `VAF >= 0.10` $\rightarrow$ **`possible_driver`**
- `VAF < 0.10` $\rightarrow$ **`likely_passenger`**

If the gene is not in the dataset:
- **`Unknown`**

> Do not claim VAF alone determines biological driver/passenger status.

---

## Dataset & Preprocessing

- **Dataset**: approximately **1,984 mutation records**
- **Target**: `LABEL=1` (driver), `LABEL=0` (passenger)
- Missing-value handling
- Class balancing
- 80/20 train-test split (`random_state=42`, Stratification)
- RobustScaler

### RobustScaler:
$$\text{Scaled Value} = \frac{\text{value} - \text{median}}{\text{IQR}}$$

### Interview Answer:
> *"RobustScaler uses the median and interquartile range, making scaling less sensitive to outliers."*

---

## Mock Interview Questions & Answers

### Q1. Tell me about XMARs.
> *"XMARs is a precision-oncology project for NSCLC that analyzes molecular mutations and provides mutation classification, explainability, pathway analysis, and drug-related insights. My primary contribution was Mutation Analysis, ML Classification, and SHAP Explainability."*

### Q2. Explain the architecture.
> *"Patient mutation information enters the system, mutation features are constructed, and the Mutation Analyst Agent performs ML-based classification. RF, Gradient Boosting, and AdaBoost are combined through soft voting. SHAP explains the prediction. The result is then passed to pathway analysis and drug-related analysis."*

### Q3. What was your contribution?
> *"I worked on preparing mutation features, training RF, Gradient Boosting, and AdaBoost, combining them using soft voting, and integrating SHAP for explainability."*

### Q4. Why these models instead of a neural network?
> *"Our data is structured tabular mutation data, so tree-based ensembles are a strong fit. They can capture nonlinear relationships and are suitable for our relatively small dataset, while SHAP provides useful interpretability."*

### Q5. What is Random Forest?
> *"An ensemble of multiple decision trees. Combining many trees generally reduces overfitting and improves generalization."*

### Q6. What is Gradient Boosting?
> *"It builds trees sequentially, with each new tree trying to reduce the existing ensemble's loss or errors."*

### Q7. What is AdaBoost?
> *"It builds weak learners sequentially and increases the weights of samples previously misclassified."*

### Q8. AdaBoost vs Gradient Boosting?
> *"AdaBoost focuses on misclassified samples through sample weights, while Gradient Boosting builds subsequent trees to reduce the existing model's loss or residual errors."*

### Q9. What is soft voting?
> *"It averages the predicted probabilities from multiple models and chooses the class with the highest average probability."*

### Q10. Why not use only Gradient Boosting?
> *"Gradient Boosting was the best individual model in our experiment, but combining models can provide complementary predictions. Our soft-voting ensemble achieved 98.14%, slightly above Gradient Boosting's 98.09%."*

### Q11. What features did you use?
> *"VAF, VAF-derived indicators, coding information, cancer predisposition information, gene mutation count, and one-hot encoded mutation consequence features."*

### Q12. What is VAF?
> *"VAF is the fraction of sequencing reads supporting a particular variant."*

### Q13. What does VAF 0.45 mean?
> *"45% of the sequencing reads at that variant position support the variant."*

### Q14. What is SHAP?
> *"SHAP is an explainable AI technique based on Shapley values that explains feature contributions to a model prediction."*

### Q15. Why SHAP?
> *"Feature importance gives general importance, while SHAP explains an individual prediction and shows which features pushed it toward Driver or Passenger and by how much."*

### Q16. Does SHAP prove the model is correct?
> *"No. SHAP explains why the model made a prediction; evaluation metrics determine predictive performance."*

### Q17. What if a gene is not in the dataset?
> *"We don't make a confident driver/passenger classification; it is handled as unknown."*

---

## 🚫 Things Not To Claim

- ❌ Do **not** claim you built the entire project.
- ❌ Do **not** claim VAF alone determines driver status.
- ❌ Do **not** claim SHAP proves correctness.
- ❌ Do **not** claim 98.14% means clinical accuracy.
- ❌ Do **not** claim CrewAI is actively used unless verified.
- ❌ Do **not** claim PostgreSQL is actively used unless verified.
- ❌ Do **not** claim high VAF automatically means driver.
- ❌ Do **not** claim low VAF automatically means passenger.

---

## ⚡ Quick Memory Sheet

```text
XMARs              → precision oncology / NSCLC
My part            → Mutation Analysis + ML + SHAP
Features           → VAF + mutation details

RF                 → many trees → reduce overfitting
Gradient Boosting  → sequential trees → reduce loss/error
AdaBoost           → sequential learners → increase weight of wrong samples
Soft Voting        → average probabilities

Model Results:
RF                 → 96.97%
GB                 → 98.09%
AdaBoost           → 96.78%
Ensemble           → 98.14%
F1                 → 0.9814

SHAP               → WHY
Feature value      → actual input
SHAP value         → contribution
VAF 0.45           → 45% of reads support the variant
Unknown gene       → unknown classification
```
