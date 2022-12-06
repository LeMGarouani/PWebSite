---
title: "Towards Efficient and Explainable Automated Machine Learning Pipelines Design"
date: "2022-09-27"
information: "PhD thesis - Laboratoire d’Informatique Signal et Image de la Côte d’Opale, Calais France"
category: 5 # 1: article, 2: conference, 3: softwares, 4: Poster
contributors: ["Moncef Garouani"]
doi: "https://theses.hal.science/tel-03842609"
---


# Abstract
<p style='text-align: justify;'>
Machine learning (ML) has penetrated all aspects of the modern life, and brought more convenience and satisfaction for variables of interest. However, building such solutions is a time consuming and challenging process that requires highly technical expertise. This certainly engages many more people, not necessarily experts, to perform analytics tasks. While the selection and the parametrization of ML models require tedious episodes of trial and error. Additionally, domain experts often lack the expertise to apply advanced analytics. Consequently, it necessitates frequent consultations with data scientists; nevertheless, such collaborations tends to cost the delays, which can lead to risks such as human-resource bottlenecks. As the complexity of these tasks increases, so does the demand for support solutions. In response, the field of automated ML (AutoML) is a data mining-based formalism that aims to reduce human effort and speedup the development cycle through automation.
The field of AutoML aims to make these decisions in a data-driven, objective, and automated way. Thereby, AutoML makes ML techniques accessible to domain scientists who are interested in applying advanced analytics but lack the required expertise. This can be seen as a democratization of ML. AutoML is usually treated as an algorithms selection and parametrization problem. In this regard, existing approaches include Bayesian optimization, evolutionary algorithms as well as reinforcement learning. These approaches have focused on providing user assistance by automating parts or the entire data analysis process, but without being concerned on its impact on the analysis. The goal has generally been focused on the performance factors, thus leaving aside other important and even crucial aspects such as computational complexity, confidence and transparency. In contrast, this thesis aims at developing alternative methods that provide assistance in building appropriate modeling techniques while providing the rationale for the selected models. In particular, we consider this important demand in intelligent assistance as a meta-analysis process, and we make progress towards addressing two challenges in AutoML research. First, to overcome the computational complexity problem, we studied a formulation of AutoML as a recommendation problem, and proposed a new conceptualization of a Meta-Learning (MtL)-based expert system capable of recommending optimal ML pipelines for a given task; Second, we investigated the automatic explainability aspect of the AutoML process to address the problem of the acceptance of, and the trust in such black-boxes support systems.
To this end, we have designed and implemented a framework architecture that leverages ideas from MtL to learn the relationship between a new set of datasets meta-data and mining algorithms. This eventually enables recommending ML pipelines according to their potential impact on the analysis. To guide the development of our work, we chose to focus on the Industry 4.0 as a main field of application for all the constraints it offers. Finally, in this doctoral thesis, we focus on the user assistance in the algorithms selection and tuning step. We devise an architecture and build a tool, AMLBID, that provides users support with the aim of improving the analysis and decreasing the amount of time spent in algorithms selection and parametrization. It is a tool that for the first time does not aim at providing data analysis support only, but instead, it is oriented towards positively contributing to the trust-in such powerful support systems by automatically providing a set of explanation levels to inspect the provided results.
</p>


# Citation

```
@Thesis{GarouaniPhd,
    author      = {Moncef Garouani},
    title       = {Towards Efficient and Explainable Automated Machine Learning Pipelines Design: Application to Industry 4.0 Data},
    type        = {Artificial Intelligence}, 
    institution = { Université du Littoral Côte d’Opale; Université Hassan II de Casablanca },
    year        = {2022},
}
```