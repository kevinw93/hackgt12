'''
Functions related to predict cell types
'''
import math
import os, sys


import tensorflow as tf
import numpy as np

## import my package
import _utils_new


## get the logger
# import logging
# logger = logging.getLogger(__name__)


# change args



def predict(file_path):
    import pandas as pd
    import anndata
    # find how to load properly
    model = tf.keras.models.load_model("saved_model.pb")

    # load feature file and onehotencoder enumeration file, find them first by training
    # CHANGE
    feature_file = "variables.index"
    encoder_file = "variabkes.data-00000-of-00"

    features = pd.read_csv(feature_file, sep='\t', header=0, index_col=0)
    encoders = {}
    with open(encoder_file) as f:
        for line in f:
            line_info = line.strip().split(':')
            encoders[int(line_info[0])] = line_info[1]

    ## load input data
    print("Loading data... \n This may take a while depending on your data size..")

    test_adata = anndata.read_h5ad(file_path)  # test




    print("start")
    genes = (list(test_adata.var["gene_symbols"].values))
    with open('test_genes.txt', 'w') as f:
        for line in list(test_adata.var["gene_symbols"].values):
            f.write(line)
            f.write('\n')
    ## fill in the data with the same order of features
    feature_idx = []

    NA_idx = []
    for f_idx, feature in enumerate(features.index):
        find_flag = False
        for test_idx, gene in enumerate(test_adata.var_names):
            if gene.lower() == feature.split(",")[0].lower():
                feature_idx.append(test_idx)
                find_flag = True
                break
        if not find_flag:
            feature_idx.append(-1)
            NA_idx.append(f_idx)
    #print("%d genes from reference data are found in target.\n" % (len(features) - len(NA_idx)))

    if len(NA_idx) > 0.1 * len(features):
        print("Warnings: too few genes found in target and this will result in inaccurate prediction.")
    if -1 in feature_idx:
        print("Warnings: since some feature does not exist in target dataset. We will fill in 0s for those columns.")
        ## first replace those unique genes with index
        curated_feature_idx = np.array(feature_idx)
        curated_feature_idx[NA_idx] = 0
        test_adata = test_adata[:, curated_feature_idx].copy()
        test_adata.var_names.values[NA_idx] = ["GenesNotFound-" + str(i) for i, NA_item in
                                               enumerate(NA_idx)]  ## change gene names
        test_adata_X = test_adata.X
        test_adata_X[:, NA_idx] = 0
        test_adata.X = test_adata_X
    else:
        test_adata = test_adata[:, feature_idx]
    print("start")
    # print("Data shape after processing: %d cells X %d genes" % (test_adata.shape[0], test_adata.shape[1]))
    # print(" train_adata.var")
    ## scale data by train data mu/std
    test_data_mat = _utils_new._extract_adata(test_adata)
    test_adata.var['mean'] = np.mean(test_data_mat, axis=0).reshape(-1, 1)
    test_adata.var['std'] = np.std(test_data_mat, axis=0).reshape(-1, 1)
    test_data_mat = (test_data_mat - np.array(test_adata.var['mean'])) / np.array(test_adata.var['std'])

    y_pred = tf.nn.softmax(model.predict(test_data_mat)).numpy()


    pred_celltypes = _utils_new._prob_to_label(y_pred, encoders)
    test_adata.obs[_utils_new.PredCelltype_COLUMN] = pred_celltypes
    print("done")
    # change output file

    # change filepath
    print(test_adata.obs['pred_celltype'].values)
    print(test_adata.obs['cell.type'].values)

    return test_adata.obs['pred_celltype'].values


