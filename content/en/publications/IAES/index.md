---
title: "Product defect detection based on convolutional autoencoder and one-class classification"
date: "2022-08-16"
information: "The IAES International Journal of Artificial Intelligence"
category: 1 # 1: article, 2: conference, 3: softwares, 4: others
contributors: ["Meryem Chaabi", "Mohamed Hamlich", "Moncef Garouani"]
doi: "10.11591/ijai.v12.i2.pp912-920"
---
# Abstract
<p style='text-align: justify;'> 
To meet customer expectations and remain competitive, industrials try constantly to improve their quality control systems. There is hence increasing demand for adopting automatic defect detection solutions. However, the biggest issue in addressing such systems is the imbalanced aspect of industrial datasets. Often, defect-free samples far exceed the defected ones, due to continuous improvement approaches adopted by manufacturing companies. In this sense, we propose an automatic defect detection system based on one-class classification (OCC) since it involves only normal samples during training. It consists of three sub-models, first, a convolutional autoencoder serves as latent features extractor, the extracted features vectors are subsequently fed into the dimensionality reduction process by performing principal component analysis (PCA), then the reduced-dimensional data are used to train the one-class classifier support vector data description (SVDD). During the test phase, both normal and defected images are used. The first two stages of the trained model generate a low-dimensional features vector, whereas the SVDD classifies the new input, whether it is defect-free or defected. This approach is evaluated on the carpet images from the industrial inspection dataset MVTec anomaly detection (MVTec AD). During training, only normal images were used. The results showed that the proposed method outperforms the state-of-the-art methods. </p>

 
# Citation

```
@article{Garouani2022_iaes,
  doi = {10.11591/ijai.v12.i2.pp912-920},
  url = {https://doi.org/10.11591/ijai.v12.i2.pp912-920},
	year = 2023,
	month = {jun},
	publisher = {Institute of Advanced Engineering and Science},
	volume = {12},
	number = {2},
	pages = {912},
	author = {Meryem Chaabi and Mohamed Hamlich and Moncef Garouani},
  title = {Product defect detection based on convolutional autoencoder and one-class classification},
  journal = {IAES International Journal of Artificial Intelligence}
}
```
