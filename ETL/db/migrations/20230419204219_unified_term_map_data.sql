-- migrate:up
insert into unified_term_map (original_term, term)
select key as original_term, value as term
from jsonb_each_text('{"Adipose - Subcutaneous":"Subcutaneous adipose tissue","Adipose - Visceral (Omentum)":"Bto:0000441","Adrenal Gland":"Adrenal gland","Adult Adrenal":"Adrenal gland","Adult Colon":"Colon","Adult Esophagus":"Esophagus","Adult Frontal Cortex":"Frontal lobe","Adult Gallbladder":"Gall bladder","Adult Heart":"Heart","Adult Kidney":"Kidney","Adult Liver":"Liver","Adult Lung":"Lung","Adult Ovary":"Ovary","Adult Pancreas":"Pancreas","Adult Prostate":"Prostate gland","Adult Rectum":"Rectum","Adult Retina":"Retina","Adult Spinal Cord":"Spinal cord","Adult Testis":"Testis","Adult Urinary Bladder":"Urinary bladder","Artery - Aorta":"Aorta","Artery - Coronary":"Coronary artery","Artery - Tibial":"Artery","B Cells":"B cell","Bladder":"Bladder","Bladder-b cell":"B cell","Bladder-bladder urothelial cell":"Bladder urothelial cell","Bladder-capillary endothelial cell":"Capillary endothelial cell","Bladder-endothelial cell of lymphatic vessel":"Endothelial cell of lymphatic vessel","Bladder-fibroblast":"Fibroblast","Bladder-macrophage":"Macrophage","Bladder-mast cell":"Mast cell","Bladder-myofibroblast cell":"Myofibroblast cell","Bladder-nk cell":"Natural killer cell","Bladder-pericyte cell":"Pericyte","Bladder-plasma cell":"Plasma cell","Bladder-plasmacytoid dendritic cell":"Plasmacytoid dendritic cell","Bladder-smooth muscle cell":"Smooth muscle cell","Bladder-t cell":"T cell","Bladder-vein endothelial cell":"Vein endothelial cell","Blood-basophil":"Basophil","Blood-cd141-positive myeloid dendritic cell":"Cd141-positive myeloid dendritic cell","Blood-cd24 neutrophil":"Neutrophil","Blood-cd4-positive, alpha-beta memory t cell":"Cd4-positive, alpha-beta memory t cell","Blood-cd4-positive, alpha-beta t cell":"Cd4-positive, alpha-beta t cell","Blood-cd8-positive, alpha-beta cytokine secreting effector t cell":"Cd8-positive, alpha-beta cytokine secreting effector t cell","Blood-cd8-positive, alpha-beta t cell":"Cd8-positive, alpha-beta t cell","Blood-classical monocyte":"Classical monocyte","Blood-erythrocyte":"Erythrocyte","Blood-granulocyte":"Granulocyte","Blood-hematopoietic stem cell":"Hematopoietic stem cell","Blood-macrophage":"Macrophage","Blood-memory b cell":"Memory b cell","Blood-monocyte":"Monocyte","Blood-myeloid progenitor":"Common myeloid progenitor","Blood-naive b cell":"Naive b cell","Blood-naive thymus-derived cd4-positive, alpha-beta t cell":"Naive thymus-derived cd4-positive, alpha-beta t cell","Blood-nampt neutrophil":"Neutrophil","Blood-neutrophil":"Neutrophil","Blood-nk cell":"Natural killer cell","Blood-non-classical monocyte":"Non-classical monocyte","Blood-plasma cell":"Plasma cell","Blood-plasmablast":"Plasmablast","Blood-plasmacytoid dendritic cell":"Plasmacytoid dendritic cell","Blood-platelet":"Platelet","Blood-t cell":"T cell","Blood-type i nk t cell":"Type i nk t cell","Bone_Marrow-cd24 neutrophil":"Neutrophil","Bone_Marrow-cd4-positive, alpha-beta t cell":"Cd4-positive, alpha-beta t cell","Bone_Marrow-cd8-positive, alpha-beta t cell":"Cd8-positive, alpha-beta t cell","Bone_Marrow-erythrocyte":"Erythrocyte","Bone_Marrow-erythroid progenitor":"Erythroid progenitor cell","Bone_Marrow-granulocyte":"Granulocyte","Bone_Marrow-hematopoietic stem cell":"Hematopoietic stem cell","Bone_Marrow-macrophage":"Macrophage","Bone_Marrow-memory b cell":"Memory b cell","Bone_Marrow-monocyte":"Monocyte","Bone_Marrow-myeloid progenitor":"Common myeloid progenitor","Bone_Marrow-naive b cell":"Naive b cell","Bone_Marrow-nampt neutrophil":"Neutrophil","Bone_Marrow-neutrophil":"Neutrophil","Bone_Marrow-nk cell":"Natural killer cell","Bone_Marrow-plasma cell":"Plasma cell","Brain - Amygdala":"Amygdala","Brain - Anterior cingulate cortex (BA24)":"Anterior cingulate cortex","Brain - Caudate (basal ganglia)":"Caudate putamen","Brain - Cerebellar Hemisphere":"Cerebral hemisphere","Brain - Cerebellum":"Cerebellum","Brain - Cortex":"Brain cortex cell line","Brain - Frontal Cortex (BA9)":"Frontal lobe","Brain - Hippocampus":"Hippocampus","Brain - Hypothalamus":"Hypothalamus","Brain - Nucleus accumbens (basal ganglia)":"Nucleus accumbens","Brain - Putamen (basal ganglia)":"Caudate putamen","Brain - Spinal cord (cervical c-1)":"Spinal cord","Brain - Substantia nigra":"Substantia nigra","Breast - Mammary Tissue":"Mammary gland","CD4 Cells":"Cd4-positive, alpha-beta t cell","CD8 Cells":"Cd8-positive, alpha-beta t cell","Cells - Cultured fibroblasts":"Fibroblast","Cells - EBV-transformed lymphocytes":"Lymphocyte of b lineage","Cervix - Ectocervix":"Uterine cervix","Cervix - Endocervix":"Endocervix","Colon - Sigmoid":"Colon sigmoideum","Colon - Transverse":"Colon transversum","Esophagus - Gastroesophageal Junction":"Esophagus","Esophagus - Mucosa":"Esophagus","Esophagus - Muscularis":"Esophagus","Eye-adipocyte":"Fat cell","Eye-b cell":"B cell","Eye-cd4-positive, alpha-beta t cell":"Cd4-positive, alpha-beta t cell","Eye-cd8-positive, alpha-beta t cell":"Cd8-positive, alpha-beta t cell","Eye-ciliary body":"Ciliary body","Eye-conjunctival epithelial cell":"Conjunctival epithelial cell","Eye-corneal epithelial cell":"Corneal epithelial cell","Eye-corneal keratocyte":"Keratocyte","Eye-dendritic cell":"Dendritic cell","Eye-endothelial cell":"Endothelial cell","Eye-epithelial cell of lacrimal sac":"Epithelial cell of lacrimal sac","Eye-erythroid lineage cell":"Erythroid lineage cell","Eye-eye photoreceptor cell":"Eye photoreceptor cell","Eye-fibroblast":"Fibroblast","Eye-lacrimal gland functional unit cell":"Tear gland","Eye-limbal stem cell":"Stem cell","Eye-limbal stromal cell":"Stromal cell","Eye-macrophage":"Macrophage","Eye-mast cell":"Mast cell","Eye-melanocyte":"Melanocyte","Eye-microglial cell":"Microglial cell","Eye-monocyte":"Monocyte","Eye-muller cell":"Mueller cell","Eye-ocular surface cell":"Ovarian surface epithelial cell","Eye-plasma cell":"Plasma cell","Eye-radial glial cell":"Radial glial cell","Eye-retina horizontal cell":"Retina horizontal cell","Eye-retinal bipolar neuron":"Retinal bipolar neuron","Eye-retinal blood vessel endothelial cell":"Retinal blood vessel endothelial cell","Eye-retinal ganglion cell":"Retinal ganglion cell","Eye-retinal pigment epithelial cell":"Retinal pigment epithelial cell","Eye-t cell":"T cell","Fallopian Tube":"Oviduct","Fat-endothelial cell":"Endothelial cell","Fat-fibroblast":"Fibroblast","Fat-leucocyte":"Leukocyte","Fat-macrophage":"Macrophage","Fat-mast cell":"Mast cell","Fat-mesenchymal stem cell":"Mesenchymal stem cell","Fat-myofibroblast cell":"Myofibroblast cell","Fat-neutrophil":"Neutrophil","Fat-nk cell":"Natural killer cell","Fat-plasma cell":"Plasma cell","Fat-smooth muscle cell":"Smooth muscle cell","Fat-t cell":"T cell","Heart - Atrial Appendage":"Atrial appendage","Heart - Left Ventricle":"Left ventricle","Heart-cardiac endothelial cell":"Cardiac endothelial cell","Heart-cardiac muscle cell":"Cardiac muscle cell","Heart-fibroblast of cardiac tissue":"Fibroblast of cardiac tissue","Heart-hepatocyte":"Hepatocyte","Heart-macrophage":"Macrophage","Heart-smooth muscle cell":"Smooth muscle cell","Kidney - Cortex":"Renal cortex","Kidney - Medulla":"Renal medulla","Kidney-b cell":"B cell","Kidney-cd4-positive helper t cell":"Cd4-positive helper t cell","Kidney-cd8-positive, alpha-beta t cell":"Cd8-positive, alpha-beta t cell","Kidney-endothelial cell":"Endothelial cell","Kidney-kidney epithelial cell":"Kidney epithelial cell","Kidney-macrophage":"Macrophage","Kidney-nk cell":"Natural killer cell","Large_Intestine-b cell":"B cell","Large_Intestine-cd4-positive, alpha-beta t cell":"Cd4-positive, alpha-beta t cell","Large_Intestine-cd8-positive, alpha-beta t cell":"Cd8-positive, alpha-beta t cell","Large_Intestine-enterocyte of epithelium of large intestine":"Enterocyte of epithelium of large intestine","Large_Intestine-fibroblast":"Fibroblast","Large_Intestine-goblet cell":"Goblet cell","Large_Intestine-gut endothelial cell":"Gut endothelial cell","Large_Intestine-immature enterocyte":"Enterocyte","Large_Intestine-intestinal crypt stem cell":"Intestinal crypt stem cell","Large_Intestine-intestinal crypt stem cell of large intestine":"Intestinal crypt stem cell of large intestine","Large_Intestine-intestinal enteroendocrine cell":"Intestinal enteroendocrine cell","Large_Intestine-intestinal tuft cell":"Intestinal tuft cell","Large_Intestine-large intestine goblet cell":"Large intestine goblet cell","Large_Intestine-mast cell":"Mast cell","Large_Intestine-mature enterocyte":"Enterocyte","Large_Intestine-monocyte":"Monocyte","Large_Intestine-neutrophil":"Neutrophil","Large_Intestine-paneth cell of epithelium of large intestine":"Paneth cell of colon","Large_Intestine-plasma cell":"Plasma cell","Large_Intestine-transit amplifying cell of large intestine":"Transit amplifying cell of colon","Liver":"Liver","Liver-endothelial cell":"Endothelial cell","Liver-endothelial cell of hepatic sinusoid":"Endothelial cell of hepatic sinusoid","Liver-erythrocyte":"Erythrocyte","Liver-fibroblast":"Fibroblast","Liver-hepatocyte":"Hepatocyte","Liver-intrahepatic cholangiocyte":"Intrahepatic cholangiocyte","Liver-liver dendritic cell":"Liver dendritic cell","Liver-macrophage":"Macrophage","Liver-monocyte":"Monocyte","Liver-neutrophil":"Neutrophil","Liver-nk cell":"Natural killer cell","Liver-plasma cell":"Plasma cell","Liver-t cell":"T cell","Lung":"Lung","Lung-adventitial cell":"Adventitial cell","Lung-alveolar fibroblast":"Fibroblast of lung","Lung-b cell":"B cell","Lung-basal cell":"Basal cell","Lung-basophil":"Basophil","Lung-bronchial smooth muscle cell":"Bronchial smooth muscle cell","Lung-bronchial vessel endothelial cell":"Blood vessel endothelial cell","Lung-capillary aerocyte":"Alveolar capillary type 1 endothelial cell","Lung-capillary endothelial cell":"Capillary endothelial cell","Lung-cd4-positive alpha-beta t cell":"Cd4-positive, alpha-beta t cell","Lung-cd4-positive, alpha-beta t cell":"Cd4-positive, alpha-beta t cell","Lung-cd8-positive alpha-beta t cell":"Cd8-positive, alpha-beta t cell","Lung-cd8-positive, alpha-beta t cell":"Cd8-positive, alpha-beta t cell","Lung-classical monocyte":"Classical monocyte","Lung-club cell":"Club cell","Lung-dendritic cell":"Dendritic cell","Lung-endothelial cell of artery":"Endothelial cell of artery","Lung-endothelial cell of lymphatic vessel":"Endothelial cell of lymphatic vessel","Lung-fibroblast":"Fibroblast","Lung-intermediate monocyte":"Intermediate monocyte","Lung-lung ciliated cell":"Lung ciliated cell","Lung-lung microvascular endothelial cell":"Lung microvascular endothelial cell","Lung-macrophage":"Macrophage","Lung-mesothelial cell":"Mesothelial cell","Lung-myofibroblast cell":"Myofibroblast cell","Lung-neutrophil":"Neutrophil","Lung-nk cell":"Natural killer cell","Lung-non-classical monocyte":"Non-classical monocyte","Lung-pericyte cell":"Pericyte","Lung-plasma cell":"Plasma cell","Lung-plasmacytoid dendritic cell":"Plasmacytoid dendritic cell","Lung-pulmonary ionocyte":"Pulmonary ionocyte","Lung-respiratory goblet cell":"Respiratory goblet cell","Lung-respiratory mucous cell":"Respiratory goblet cell","Lung-serous cell of epithelium of bronchus":"Serous cell of epithelium of bronchus","Lung-smooth muscle cell":"Smooth muscle cell","Lung-type i pneumocyte":"Type i pneumocyte","Lung-type ii pneumocyte":"Type ii pneumocyte","Lung-vascular associated smooth muscle cell":"Vascular associated smooth muscle cell","Lung-vein endothelial cell":"Vein endothelial cell","Lymph_Node-b cell":"B cell","Lymph_Node-cd141-positive myeloid dendritic cell":"Cd141-positive myeloid dendritic cell","Lymph_Node-cd1c-positive myeloid dendritic cell":"Cd1c-positive myeloid dendritic cell","Lymph_Node-cd4-positive alpha-beta t cell":"Cd4-positive, alpha-beta t cell","Lymph_Node-cd4-positive, alpha-beta memory t cell":"Cd4-positive, alpha-beta memory t cell","Lymph_Node-cd8-positive alpha-beta t cell":"Cd8-positive, alpha-beta t cell","Lymph_Node-cd8-positive, alpha-beta memory t cell":"Cd8-positive, alpha-beta memory t cell","Lymph_Node-classical monocyte":"Classical monocyte","Lymph_Node-endothelial cell":"Endothelial cell","Lymph_Node-erythrocyte":"Erythrocyte","Lymph_Node-hematopoietic stem cell":"Hematopoietic stem cell","Lymph_Node-innate lymphoid cell":"Innate lymphoid cell","Lymph_Node-intermediate monocyte":"Intermediate monocyte","Lymph_Node-macrophage":"Macrophage","Lymph_Node-mast cell":"Mast cell","Lymph_Node-mature conventional dendritic cell":"Mature conventional dendritic cell","Lymph_Node-mature nk t cell":"Mature nk t cell","Lymph_Node-memory b cell":"Memory b cell","Lymph_Node-naive b cell":"Naive b cell","Lymph_Node-naive thymus-derived cd4-positive, alpha-beta t cell":"Naive thymus-derived cd4-positive, alpha-beta t cell","Lymph_Node-neutrophil":"Neutrophil","Lymph_Node-nk cell":"Natural killer cell","Lymph_Node-non-classical monocyte":"Non-classical monocyte","Lymph_Node-plasma cell":"Plasma cell","Lymph_Node-plasmacytoid dendritic cell":"Plasmacytoid dendritic cell","Lymph_Node-regulatory t cell":"Regulatory t cell","Lymph_Node-stromal cell":"Stromal cell","Lymph_Node-t cell":"T cell","Lymph_Node-type i nk t cell":"Type i nk t cell","Mammary-b cell":"B cell","Mammary-basal cell":"Basal cell","Mammary-endothelial cell of artery":"Endothelial cell of artery","Mammary-endothelial cell of lymphatic vessel":"Endothelial cell of lymphatic vessel","Mammary-fibroblast of breast":"Fibroblast of breast","Mammary-luminal epithelial cell of mammary gland":"Luminal epithelial cell of mammary gland","Mammary-macrophage":"Macrophage","Mammary-mast cell":"Mast cell","Mammary-nk cell":"Natural killer cell","Mammary-pericyte cell":"Pericyte","Mammary-plasma cell":"Plasma cell","Mammary-t cell":"T cell","Mammary-vascular associated smooth muscle cell":"Vascular associated smooth muscle cell","Mammary-vein endothelial cell":"Vein endothelial cell","Minor Salivary Gland":"Salivary gland","Monocytes":"Monocyte","Muscle - Skeletal":"Skeletal muscle","Muscle-capillary endothelial cell":"Capillary endothelial cell","Muscle-cd4-positive, alpha-beta t cell":"Cd4-positive, alpha-beta t cell","Muscle-cd8-positive, alpha-beta t cell":"Cd8-positive, alpha-beta t cell","Muscle-endothelial cell of artery":"Endothelial cell of artery","Muscle-endothelial cell of lymphatic vessel":"Endothelial cell of lymphatic vessel","Muscle-endothelial cell of vascular tree":"Endothelial cell of vascular tree","Muscle-erythrocyte":"Erythrocyte","Muscle-fast muscle cell":"Fast muscle cell","Muscle-macrophage":"Macrophage","Muscle-mast cell":"Mast cell","Muscle-mature nk t cell":"Mature nk t cell","Muscle-mesenchymal stem cell":"Mesenchymal stem cell","Muscle-mesothelial cell":"Mesothelial cell","Muscle-pericyte cell":"Pericyte","Muscle-skeletal muscle satellite stem cell":"Skeletal muscle satellite stem cell","Muscle-slow muscle cell":"Slow muscle cell","Muscle-smooth muscle cell":"Smooth muscle cell","Muscle-t cell":"T cell","Muscle-tendon cell":"Tendon cell","NK Cells":"Natural killer cell","Nerve - Tibial":"Nerve","Ovary":"Ovary","Pancreas":"Pancreas","Pancreas-b cell":"B cell","Pancreas-endothelial cell":"Endothelial cell","Pancreas-fibroblast":"Fibroblast","Pancreas-mast cell":"Mast cell","Pancreas-myeloid cell":"Myeloid cell","Pancreas-nk cell":"Natural killer cell","Pancreas-pancreatic acinar cell":"Pancreatic acinar cell","Pancreas-pancreatic alpha cell":"Pancreatic a cell","Pancreas-pancreatic beta cell":"Type b pancreatic cell","Pancreas-pancreatic delta cell":"Pancreatic d cell","Pancreas-pancreatic ductal cell":"Pancreatic ductal cell","Pancreas-pancreatic pp cell":"Pancreatic pp cell","Pancreas-pancreatic stellate cell":"Pancreatic stellate cell","Pancreas-plasma cell":"Plasma cell","Pancreas-t cell":"T cell","Pituitary":"Pituitary gland cell line","Placenta":"Placenta","Platelets":"Platelet","Prostate":"Prostate gland cell line","Prostate-basal cell of prostate epithelium":"Basal cell of prostate epithelium","Prostate-cd8-positive, alpha-beta t cell":"Cd8-positive, alpha-beta t cell","Prostate-cd8b-positive nk t cell":"Mature nk t cell","Prostate-club cell of prostate epithelium":"Club-like cell of the urethral epithelium","Prostate-endothelial cell":"Endothelial cell","Prostate-epithelial cell":"Epithelial cell","Prostate-erythroid progenitor":"Erythroid progenitor cell","Prostate-fibroblast":"Fibroblast","Prostate-hillock cell of prostate epithelium":"Hillock cell of prostatic urethral epithelium","Prostate-hillock-club cell of prostate epithelium":"Hillock cell of prostatic urethral epithelium","Prostate-luminal cell of prostate epithelium":"Luminal cell of prostate epithelium","Prostate-macrophage":"Macrophage","Prostate-mast cell":"Mast cell","Prostate-myeloid cell":"Myeloid cell","Prostate-neutrophil":"Neutrophil","Prostate-nkt cell":"Mature nk t cell","Prostate-smooth muscle cell":"Smooth muscle cell","Prostate-sperm":"Sperm","Prostate-t cell":"T cell","Salivary_Gland-acinar cell of salivary gland":"Acinar cell of salivary gland","Salivary_Gland-adventitial cell":"Adventitial cell","Salivary_Gland-b cell":"B cell","Salivary_Gland-basal cell":"Basal cell","Salivary_Gland-cd4-positive helper t cell":"Cd4-positive helper t cell","Salivary_Gland-cd8-positive, alpha-beta t cell":"Cd8-positive, alpha-beta t cell","Salivary_Gland-duct epithelial cell":"Duct epithelial cell","Salivary_Gland-endothelial cell":"Endothelial cell","Salivary_Gland-endothelial cell of lymphatic vessel":"Endothelial cell of lymphatic vessel","Salivary_Gland-fibroblast":"Fibroblast","Salivary_Gland-ionocyte":"Ionocyte","Salivary_Gland-macrophage":"Macrophage","Salivary_Gland-memory b cell":"Memory b cell","Salivary_Gland-monocyte":"Monocyte","Salivary_Gland-myoepithelial cell":"Myoepithelial cell","Salivary_Gland-naive b cell":"Naive b cell","Salivary_Gland-neutrophil":"Neutrophil","Salivary_Gland-nk cell":"Natural killer cell","Salivary_Gland-pericyte cell":"Pericyte","Salivary_Gland-plasma cell":"Plasma cell","Salivary_Gland-salivary gland cell":"Salivary gland cell","Salivary_Gland-t cell":"T cell","Skin - Not Sun Exposed (Suprapubic)":"Skin","Skin - Sun Exposed (Lower leg)":"Skin","Skin-cd141-positive myeloid dendritic cell":"Cd141-positive myeloid dendritic cell","Skin-cd1c-positive myeloid dendritic cell":"Cd1c-positive myeloid dendritic cell","Skin-cd4-positive helper t cell":"Cd4-positive helper t cell","Skin-cd4-positive, alpha-beta memory t cell":"Cd4-positive, alpha-beta memory t cell","Skin-cd8-positive, alpha-beta cytotoxic t cell":"Cd8-positive, alpha-beta cytotoxic t cell","Skin-cd8-positive, alpha-beta memory t cell":"Cd8-positive, alpha-beta memory t cell","Skin-cell of skeletal muscle":"Cell of skeletal muscle","Skin-endothelial cell":"Endothelial cell","Skin-epithelial cell":"Epithelial cell","Skin-langerhans cell":"Langerhans cell","Skin-macrophage":"Macrophage","Skin-mast cell":"Mast cell","Skin-melanocyte":"Melanocyte","Skin-memory b cell":"Memory b cell","Skin-muscle cell":"Muscle cell","Skin-naive b cell":"Naive b cell","Skin-naive thymus-derived cd4-positive, alpha-beta t cell":"Naive thymus-derived cd4-positive, alpha-beta t cell","Skin-naive thymus-derived cd8-positive, alpha-beta t cell":"Naive thymus-derived cd8-positive, alpha-beta t cell","Skin-nk cell":"Natural killer cell","Skin-nkt cell":"Mature nk t cell","Skin-plasma cell":"Plasma cell","Skin-regulatory t cell":"Regulatory t cell","Skin-smooth muscle cell":"Smooth muscle cell","Skin-stromal cell":"Stromal cell","Skin-t cell":"T cell","Small Intestine - Terminal Ileum":"Ileum","Small_Intestine-b cell":"B cell","Small_Intestine-cd4-positive, alpha-beta t cell":"Cd4-positive, alpha-beta t cell","Small_Intestine-cd8-positive, alpha-beta t cell":"Cd8-positive, alpha-beta t cell","Small_Intestine-duodenum glandular cell":"Duodenum glandular cell","Small_Intestine-enterocyte of epithelium of small intestine":"Enterocyte of epithelium of small intestine","Small_Intestine-fibroblast":"Fibroblast","Small_Intestine-goblet cell":"Goblet cell","Small_Intestine-gut endothelial cell":"Gut endothelial cell","Small_Intestine-immature enterocyte":"Enterocyte","Small_Intestine-intestinal crypt stem cell":"Intestinal crypt stem cell","Small_Intestine-intestinal crypt stem cell of small intestine":"Intestinal crypt stem cell of small intestine","Small_Intestine-intestinal enteroendocrine cell":"Intestinal enteroendocrine cell","Small_Intestine-intestinal tuft cell":"Intestinal tuft cell","Small_Intestine-mast cell":"Mast cell","Small_Intestine-mature enterocyte":"Enterocyte","Small_Intestine-monocyte":"Monocyte","Small_Intestine-neutrophil":"Neutrophil","Small_Intestine-paneth cell of epithelium of small intestine":"Paneth cell of epithelium of small intestine","Small_Intestine-plasma cell":"Plasma cell","Small_Intestine-small intestine goblet cell":"Small intestine goblet cell","Small_Intestine-transit amplifying cell of small intestine":"Transit amplifying cell of small intestine","Spleen":"Spleen","Spleen-cd141-positive myeloid dendritic cell":"Cd141-positive myeloid dendritic cell","Spleen-cd1c-positive myeloid dendritic cell":"Cd1c-positive myeloid dendritic cell","Spleen-cd4-positive, alpha-beta memory t cell":"Cd4-positive, alpha-beta memory t cell","Spleen-cd8-positive, alpha-beta memory t cell":"Cd8-positive, alpha-beta memory t cell","Spleen-cd8-positive, alpha-beta t cell":"Cd8-positive, alpha-beta t cell","Spleen-classical monocyte":"Classical monocyte","Spleen-endothelial cell":"Endothelial cell","Spleen-erythrocyte":"Erythrocyte","Spleen-hematopoietic stem cell":"Hematopoietic stem cell","Spleen-innate lymphoid cell":"Innate lymphoid cell","Spleen-intermediate monocyte":"Intermediate monocyte","Spleen-macrophage":"Macrophage","Spleen-mature nk t cell":"Mature nk t cell","Spleen-memory b cell":"Memory b cell","Spleen-naive b cell":"Naive b cell","Spleen-naive thymus-derived cd4-positive, alpha-beta t cell":"Naive thymus-derived cd4-positive, alpha-beta t cell","Spleen-naive thymus-derived cd8-positive, alpha-beta t cell":"Naive thymus-derived cd8-positive, alpha-beta t cell","Spleen-neutrophil":"Neutrophil","Spleen-nk cell":"Natural killer cell","Spleen-plasma cell":"Plasma cell","Spleen-plasmacytoid dendritic cell":"Plasmacytoid dendritic cell","Spleen-platelet":"Platelet","Spleen-regulatory t cell":"Regulatory t cell","Spleen-type i nk t cell":"Type i nk t cell","Stomach":"Stomach","Testis":"Testis","Thymus-b cell":"B cell","Thymus-capillary endothelial cell":"Capillary endothelial cell","Thymus-cd4-positive helper t cell":"Cd4-positive helper t cell","Thymus-cd8-positive, alpha-beta cytotoxic t cell":"Cd8-positive, alpha-beta cytotoxic t cell","Thymus-cd8-positive, alpha-beta t cell":"Cd8-positive, alpha-beta t cell","Thymus-dendritic cell":"Dendritic cell","Thymus-dn1 thymic pro-t cell":"Dn1 thymic pro-t cell","Thymus-dn3 thymocyte":"Dn3 thymocyte","Thymus-dn4 thymocyte":"Dn4 thymocyte","Thymus-endothelial cell of artery":"Endothelial cell of artery","Thymus-endothelial cell of lymphatic vessel":"Endothelial cell of lymphatic vessel","Thymus-erythrocyte":"Erythrocyte","Thymus-fast muscle cell":"Fast muscle cell","Thymus-fibroblast":"Fibroblast","Thymus-immature natural killer cell":"Immature natural killer cell","Thymus-innate lymphoid cell":"Innate lymphoid cell","Thymus-macrophage":"Macrophage","Thymus-mast cell":"Mast cell","Thymus-mature nk t cell":"Mature nk t cell","Thymus-medullary thymic epithelial cell":"Medullary thymic epithelial cell","Thymus-memory b cell":"Memory b cell","Thymus-mesothelial cell":"Mesothelial cell","Thymus-monocyte":"Monocyte","Thymus-myeloid dendritic cell":"Myeloid dendritic cell","Thymus-naive b cell":"Naive b cell","Thymus-naive regulatory t cell":"Naive regulatory t cell","Thymus-nk cell":"Natural killer cell","Thymus-plasma cell":"Plasma cell","Thymus-t follicular helper cell":"T follicular helper cell","Thymus-thymocyte":"Thymocyte","Thymus-vascular associated smooth muscle cell":"Vascular associated smooth muscle cell","Thymus-vein endothelial cell":"Vein endothelial cell","Thyroid":"Thyroid cell line","Tongue-basal cell":"Basal cell","Tongue-capillary endothelial cell":"Capillary endothelial cell","Tongue-endothelial cell of artery":"Endothelial cell of artery","Tongue-endothelial cell of lymphatic vessel":"Endothelial cell of lymphatic vessel","Tongue-epithelial cell":"Epithelial cell","Tongue-fibroblast":"Fibroblast","Tongue-immune cell":"Leukocyte","Tongue-keratinocyte":"Keratinocyte","Tongue-pericyte cell":"Pericyte","Tongue-schwann cell":"Schwann cell","Tongue-tongue muscle cell":"Tongue muscle cell","Tongue-vein endothelial cell":"Vein endothelial cell","Trachea-b cell":"B cell","Trachea-basal cell":"Basal cell","Trachea-cd4-positive, alpha-beta t cell":"Cd4-positive, alpha-beta t cell","Trachea-cd8-positive, alpha-beta t cell":"Cd8-positive, alpha-beta t cell","Trachea-ciliated cell":"Ciliated cell","Trachea-connective tissue cell":"Connective tissue cell","Trachea-double-positive, alpha-beta thymocyte":"Double-positive, alpha-beta thymocyte","Trachea-endothelial cell":"Endothelial cell","Trachea-fibroblast":"Fibroblast","Trachea-goblet cell":"Goblet cell","Trachea-ionocyte":"Ionocyte","Trachea-macrophage":"Macrophage","Trachea-mast cell":"Mast cell","Trachea-mucus secreting cell":"Mucus secreting cell","Trachea-neutrophil":"Neutrophil","Trachea-plasma cell":"Plasma cell","Trachea-secretory cell":"Secretory cell","Trachea-serous cell of epithelium of trachea":"Serous cell of epithelium of trachea","Trachea-smooth muscle cell":"Smooth muscle cell","Trachea-t cell":"T cell","Trachea-tracheal goblet cell":"Tracheal goblet cell","Uterus":"Uterus","Uterus-b cell":"B cell","Uterus-ciliated epithelial cell":"Ciliated epithelial cell","Uterus-endothelial cell":"Endothelial cell","Uterus-endothelial cell of lymphatic vessel":"Endothelial cell of lymphatic vessel","Uterus-epithelial cell":"Epithelial cell","Uterus-epithelial cell of uterus":"Epithelial cell of uterus","Uterus-fibroblast":"Fibroblast","Uterus-immune cell":"Leukocyte","Uterus-macrophage":"Macrophage","Uterus-myometrial cell":"Myometrial cell","Uterus-nk cell":"Natural killer cell","Uterus-pericyte cell":"Pericyte","Uterus-t cell":"T cell","Uterus-vascular associated smooth muscle cell":"Vascular associated smooth muscle cell","Vagina":"Vagina","Vasculature-artery endothelial cell":"Endothelial cell of artery","Vasculature-b cell":"B cell","Vasculature-endothelial cell":"Endothelial cell","Vasculature-epithelial cell":"Epithelial cell","Vasculature-erythrocyte":"Erythrocyte","Vasculature-fibroblast":"Fibroblast","Vasculature-lymphatic endothelial cell":"Endothelial cell of lymphatic vessel","Vasculature-macrophage":"Macrophage","Vasculature-mast cell":"Mast cell","Vasculature-nk cell":"Natural killer cell","Vasculature-pericyte cell":"Pericyte","Vasculature-plasma cell":"Plasma cell","Vasculature-smooth muscle cell":"Smooth muscle cell","Vasculature-t cell":"T cell","Whole Blood":"Blood","cell-adipocyte":"Adipocyte","cell-adventitial cell":"Adventitial cell","cell-alpha cell":"Alpha cell","cell-alveoalr":"Alveoalr","cell-astocyte":"Astocyte","cell-astrocyte":"Astrocyte","cell-b cell":"B cell","cell-basal cell":"Basal cell","cell-basophil":"Basophil","cell-beta cell":"Beta cell","cell-cardiomyocyte":"Cardiomyocyte","cell-cholangiocyte":"Cholangiocyte","cell-chondrocyte":"Chondrocyte","cell-chondrogenic":"Chondrogenic","cell-club cell":"Club cell","cell-cytotrophoblast":"Cytotrophoblast","cell-dendritic":"Dendritic","cell-dentritic":"Dendritic","cell-dopaminergic":"Dopaminergic","cell-ensc":"Ensc","cell-eosinophil":"Eosinophil","cell-epithelial":"Epithelial","cell-erythroblasts":"Erythroblasts","cell-erythrocyte":"Erythrocyte","cell-erythroid":"Erythroid","cell-fibroblast":"Fibroblast","cell-follicle":"Follicle","cell-glia":"Glia","cell-glial":"Glial","cell-goblet cell":"Goblet cell","cell-granulocyte":"Granulocyte","cell-granulocytic":"Granulocytic","cell-haematopoietic":"Haematopoietic","cell-haemopoietic":"Haemopoietic","cell-hameatopoietic":"Hameatopoietic","cell-hbec":"Hbec","cell-helper":"Helper","cell-hematopoietic":"Hematopoietic","cell-hepatocyte":"Hepatocyte","cell-hmec":"Hmec","cell-hmsc":"Hmsc","cell-hspcs":"Hspcs","cell-keratinocyte":"Keratinocyte","cell-langerhans":"Langerhans","cell-leucocyte":"Leucocyte","cell-leukocyte":"Leukocyte","cell-lmpp":"Lmpp","cell-lymphoblast":"Lymphoblast","cell-lymphoblastoid":"Lymphoblastoid","cell-lymphocyte":"Lymphocyte","cell-lymphoid":"Lymphoid","cell-macrophage":"Macrophage","cell-mast":"Mast","cell-megakaryocyte":"Megakaryocyte","cell-melanocyte":"Melanocyte","cell-memory b cell":"Memory b cell","cell-memory t cell":"Memory t cell","cell-mesenchymal":"Mesenchymal","cell-mesenchyme":"Mesenchyme","cell-mesothelial cell":"Mesothelial cell","cell-microglial cell":"Microglial cell","cell-monocyte":"Monocyte","cell-mononuclear cell":"Mononuclear cell","cell-motor":"Motor","cell-myeloid":"Myeloid","cell-myoblast":"Myoblast","cell-myocyte":"Myocyte","cell-myoepithelial cell":"Myoepithelial cell","cell-myofibroblast":"Myofibroblast","cell-myometrial cell":"Myometrial cell","cell-myotube":"Myotube","cell-naive b cell":"Naive b cell","cell-nasopharyngeal":"Nasopharyngeal","cell-natural killer cell":"Natural killer cell","cell-neuron":"Neuron","cell-neutrophil":"Neutrophil","cell-neutrophilic":"Neutrophilic","cell-nk cell":"Nk cell","cell-nkt cell":"Nkt cell","cell-npcs":"Npcs","cell-oligodendrocyte":"Oligodendrocyte","cell-osteoblast":"Osteoblast","cell-osteoblastic":"Osteoblastic","cell-pbmc":"Pbmc","cell-pericyte":"Pericyte","cell-pigment":"Pigment","cell-plasma cell":"Plasma cell","cell-plasmablast":"Plasmablast","cell-plasmacytoid":"Plasmacytoid","cell-platelet":"Platelet","cell-podocyte":"Podocyte","cell-regulatory t cell":"Regulatory t cell","cell-schwann cell":"Schwann cell","cell-sperm":"Sperm","cell-spermatogenesis":"Spermatogenesis","cell-spermatogonial":"Spermatogonial","cell-spermatogonium":"Spermatogonium","cell-spermatozoa":"Spermatozoa","cell-stellate":"Stellate","cell-stromal cell":"Stromal cell","cell-syncytiotrophoblast":"Syncytiotrophoblast","cell-synoviocytes":"Synoviocytes","cell-t cell":"T cell","cell-tcell":"Tcell","cell-thrombocytes":"Thrombocytes","cell-treg":"Treg","cell-whartons":"Whartons","tissue-acinar":"Acinar","tissue-adipose":"Adipose","tissue-airway":"Airway","tissue-alveolar":"Alveolar","tissue-amygdala":"Amygdala","tissue-aortic":"Aortic","tissue-arterial":"Arterial","tissue-artery":"Artery","tissue-articular":"Articular","tissue-atrial":"Atrial","tissue-atrioventricular":"Atrioventricular","tissue-atrium":"Atrium","tissue-biliary":"Biliary","tissue-bladder":"Bladder","tissue-blood":"Blood","tissue-bone":"Bone","tissue-brain":"Brain","tissue-breast":"Breast","tissue-bronchial":"Bronchial","tissue-bronchoscopy":"Bronchoscopy","tissue-bronchus":"Bronchus","tissue-cardiac":"Cardiac","tissue-cartilage":"Cartilage","tissue-caudate":"Caudate","tissue-cerebellar":"Cerebellar","tissue-cerebellum":"Cerebellum","tissue-cerebral":"Cerebral","tissue-cerebrospinal":"Cerebrospinal","tissue-cervix":"Cervix","tissue-choroid":"Choroid","tissue-cns":"Cns","tissue-colon":"Colon","tissue-connective":"Connective","tissue-cornea":"Cornea","tissue-corneal":"Corneal","tissue-cortex":"Cortex","tissue-cortical":"Cortical","tissue-cutaneous":"Cutaneous","tissue-dermal":"Dermal","tissue-dermis":"Dermis","tissue-dlpfc":"Dlpfc","tissue-duodenum":"Duodenum","tissue-endothelial":"Endothelial","tissue-endothelium":"Endothelium","tissue-epicardium":"Epicardium","tissue-epidermis":"Epidermis","tissue-epithelia":"Epithelia","tissue-epithelium":"Epithelium","tissue-esophageal":"Esophageal","tissue-esophagus":"Esophagus","tissue-eye":"Eye","tissue-fat":"Fat","tissue-gastrocnemius":"Gastrocnemius","tissue-gingival":"Gingival","tissue-gliogenic":"Gliogenic","tissue-granulosa":"Granulosa","tissue-gyrus":"Gyrus","tissue-heart":"Heart","tissue-hepatic":"Hepatic","tissue-hepatoblast":"Hepatoblast","tissue-hippocampus":"Hippocampus","tissue-hypothalamic":"Hypothalamic","tissue-hypothalamus":"Hypothalamus","tissue-ileum":"Ileum","tissue-interneurons":"Interneurons","tissue-intestine":"Intestine","tissue-intracranial":"Intracranial","tissue-islet":"Islet","tissue-kidney":"Kidney","tissue-kupffer cell":"Kupffer cell","tissue-labial":"Labial","tissue-lateralis":"Lateralis","tissue-liver":"Liver","tissue-lumbar":"Lumbar","tissue-lung":"Lung","tissue-lymph":"Lymph","tissue-lymphatic":"Lymphatic","tissue-lymphoblastic":"Lymphoblastic","tissue-mammary":"Mammary","tissue-medulla":"Medulla","tissue-microglia":"Microglia","tissue-micropapillarity":"Micropapillarity","tissue-midbrain":"Midbrain","tissue-mucosal":"Mucosal","tissue-muscle":"Muscle","tissue-myogenic":"Myogenic","tissue-myometrium":"Myometrium","tissue-neocortex":"Neocortex","tissue-nervous system":"Nervous system","tissue-neuroendocrine":"Neuroendocrine","tissue-neuroepithelial":"Neuroepithelial","tissue-neuronal":"Neuronal","tissue-nigra":"Nigra","tissue-occipital":"Occipital","tissue-olfactory":"Olfactory","tissue-osteogenic":"Osteogenic","tissue-ovarian":"Ovarian","tissue-ovaries":"Ovaries","tissue-ovary":"Ovary","tissue-pancreas":"Pancreas","tissue-papillary":"Papillary","tissue-peritoneal":"Peritoneal","tissue-placenta":"Placenta","tissue-placental":"Placental","tissue-pns":"Pns","tissue-pons":"Pons","tissue-pontine":"Pontine","tissue-prefrontal":"Prefrontal","tissue-prostate":"Prostate","tissue-rectum":"Rectum","tissue-renal":"Renal","tissue-retina":"Retina","tissue-retinal":"Retinal","tissue-salivary":"Salivary","tissue-scalp":"Scalp","tissue-septum":"Septum","tissue-skeletal":"Skeletal","tissue-skin":"Skin","tissue-small_intestine":"Small_intestine","tissue-smooth":"Smooth","tissue-spinal cord":"Spinal cord","tissue-spleen":"Spleen","tissue-stomach":"Stomach","tissue-synovial":"Synovial","tissue-testis":"Testis","tissue-thalamus":"Thalamus","tissue-thoracic":"Thoracic","tissue-thymic":"Thymic","tissue-thymus":"Thymus","tissue-tongue":"Tongue","tissue-tonsil":"Tonsil","tissue-tonsillectomy":"Tonsillectomy","tissue-trachea":"Trachea","tissue-tracheal":"Tracheal","tissue-turbinate":"Turbinate","tissue-umbilical":"Umbilical","tissue-urinary":"Urinary","tissue-urogenital":"Urogenital system","tissue-urothelial":"Urothelial","tissue-uterine":"Uterine","tissue-uterus":"Uterus","tissue-valve":"Valve","tissue-vastus":"Vastus","tissue-vein":"Vein","tissue-ventricle":"Ventricle","tissue-villus":"Villus"}')
;

-- migrate:down
delete from unified_term_map;
