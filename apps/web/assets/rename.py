# import os

# # print(list(os.walk(".")))

# for root, dirs, files in os.walk("."):
#     for file in files:
#         if(file.endswith(".svg")): 
#             os.rename(os.path.join(root, file), os.path.join(root, file.capitalize()))