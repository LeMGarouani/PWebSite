---
title: "Automated Machine Learning Hyperparameters Tuning through Meta-Guided Bayesian Optimization"
date:  "2024-01-19"
information: "Progress in Artificial Intelligence"
category: 1 # 1: article, 2: conference, 3: softwares, 4: others
contributors: ["Moncef Garouani", "Mourad Bouneffa"]
doi: "10.1007/s13748-023-00311-y"

---

# Abstract
<p style='text-align: justify;'>
The selection of one or more optimized Machine Learning (ML) algorithms and the configuration of significant hyperparameters are among the crucial but challenging tasks for the advanced data analytics using ML methodologies. However, it is one of the essential tasks in order to apply the ML-based solutions to deal with the real-world problems. In this regard, Bayesian Optimization (BO) is a popular method for optimizing black-box functions. But, yet it is deficient for large-scale problems because it fails to leverage the knowledge from historical applications. The major challenge in this aspect is due to the waste of function evaluations on bad design choices of ML hyperparameters. To address this issue, we propose to integrate Bayesian Optimization via Meta-Guidance. Consequently, Meta-Guided Bayesian Optimization provides means to use the knowledge from previous optimization cycles on similar tasks. This capability takes the form of pre-requisite to decide the specific parts of the input space to be evaluated next. In this regard, we intend to guide the BO with a functional ANOVA of configurations as suggested by a meta-learning process. In this paper, we demonstrate, with the help of a large collection of hyperparameters optimization benchmark, that the proposed Meta-Guided Optimization approach is about 3 times faster than the vanilla BO. Thence, it achieves a new state-of-the-art performance as proved by the experiments on 09 classification datasets.
</p>


 
# Citation

```
@article{Garouani2024_pai,
author = {Garouani, Moncef and Bouneffa, Mourad},
 doi = {10.1007/s13748-023-00311-y},
 issn = {2192-6360},
 journal = {Progress in Artificial Intelligence},
 month = {January},
 title = {Automated machine learning hyperparameters tuning through meta-guided Bayesian optimization},
 year = {2024}
}
```
