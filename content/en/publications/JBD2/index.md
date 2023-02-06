---
title: "Autoencoder-kNN meta-model based data characterization approach for an automated selection of AI algorithms"
date: "2023-02-03"
information: "Journal of Big Data"
category: 1 # 1: article, 2: conference, 3: softwares, 4: others
contributors: ["Moncef Garouani", "Adeel Ahmad", "Mourad Bouneffa", "al."]
doi: "10.1186/s40537-023-00687-7"
---

# Abstract
<p style='text-align: justify;'> 
The recent evolution of machine learning (ML) algorithms and the high level of expertise required to use them have fuelled the demand for non-experts solutions. The selection of an appropriate algorithm and the configuration of its hyperparameters is among the most complicated tasks while applying ML to new problems. It necessitates well awareness and knowledge of ML algorithms. The algorithm selection problem (ASP) is defined as the process of identifying the algorithm (s) that can deliver top performance for a particular problem, task, and evaluation measure. In this context, meta-learning is one of the approaches to achieve this objective by using prior learning experiences to assist the learning process on unseen problems and tasks. As a data-driven approach, appropriate data characterization is of vital importance for the meta-learning. Nonetheless, the recent literature witness a variety of data characterization techniques including simple, statistical and information theory based measures. However, their quality still needs to be improved. In this paper, a new Autoencoder-kNN (AeKNN) based meta-model with built-in latent features extraction is proposed. The approach is aimed to extract new characterizations of the data, with lower dimensionality but more significant and meaningful features. AeKNN internally uses a deep autoencoder as a latent features extractor from a set of existing meta-features induced from the dataset. From this new features vectors the computed distances are more significant, thus providing a way to accurately recommending top-performing pipelines for previously unseen datasets. In an application on a large-scale hyperparameters optimization task for 400 real world datasets with varying schemas as a meta-learning task, we show that AeKNN offers considerable improvements of the classical kNN as well as traditional meta-models in terms of performance.
</p>

 
# Citation

```
@article{Garouani2023_jbd,
  doi = {10.1186/s40537-023-00687-7},
  url = {[https://doi.org/10.1186/s40537-022-00612-4](https://doi.org/10.1186/s40537-023-00687-7)},
  year = {2023},
  month = feb,
  publisher = {Springer Science and Business Media {LLC}},
  volume = {10},
  number = {14},
  author = {Moncef Garouani and Adeel Ahmad and Mourad Bouneffa and Mohamed Hamlich},
  title = {Autoencoder-kNN meta-model based data characterization approach for an automated selection of AI algorithms},
  journal = {Journal of Big Data}
}
```
