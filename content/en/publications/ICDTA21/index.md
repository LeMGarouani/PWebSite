---
title: "Sentiment Analysis of Moroccan Tweets Using Text Mining"
date: "2021-04-28"
information: "The 23rd International Conference on Enterprise Information Systems(ICEIS)"
category: 2 # 1: article, 2: conference, 3: softwares, 4: others
contributors: ["Moncef Garouani", "Hanae Chrita", "Jamal Kharroubi"]
doi: "10.1007/978-3-030-73882-2_54"
---

# Abstract
This paper introduces a framework system that analyzes the data extracted from the social network Twitter. In our study, we deal with Moroccan tweets written in Standard Arabic (SA) and Moroccan Dialect (MD). This system allows collecting, processing and visualizing sentiments that could be extracted from Moroccan user’s communication. As a training set, 36114 tweets were collected but only 13,550 tweets were found to be valid. Firstly, the tweets are classified into 2 categories: SA and MD. The tweets belonging to each category are then classified into 4 classes: positive, negative, neutral or mixed. We have performed several experiments to evaluate all the possible combinations of the following weight schemes: N-grams and stemming terms techniques. The experimental results provide the best scenario for each classifier and indicate that LSTM classifier using word embedding without removing Stopwords outperforms CNN classifier as well as the CNN-LSTM classifier (with the same features), and it outperforms SVM with term frequency–inverse document frequency (TF-IDF) weighting scheme with stemming through Bigrams feature. Moreover, the obtained results outperformed other comparable related work results.



 
# Citation

```
@incollection{Garouani2021,
  doi = {10.1007/978-3-030-73882-2_54},
  url = {https://doi.org/10.1007/978-3-030-73882-2_54},
  year = {2021},
  publisher = {Springer International Publishing},
  pages = {597--608},
  author = {Moncef Garouani and Hanae Chrita and Jamal Kharroubi},
  title = {Sentiment Analysis of Moroccan Tweets Using Text Mining},
  booktitle = {Digital Technologies and Applications}
}
```