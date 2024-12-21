import os

def print_folder_structure(folder_path, indent_level=0):
    # 获取当前文件夹下的所有内容
    entries = os.listdir(folder_path)
    
    # 输出当前文件夹名
    print("  " * indent_level + f"[Folder] {os.path.basename(folder_path)}")
    
    # 遍历文件夹内容
    for entry in entries:
        entry_path = os.path.join(folder_path, entry)
        if os.path.isdir(entry_path):
            # 递归打印子文件夹
            print_folder_structure(entry_path, indent_level + 1)
        else:
            # 打印文件名
            print("  " * (indent_level + 1) + f"- {entry}")

# 输入文件夹路径
folder_path = r"D:\wsl\识物探趣课题材料\识物探趣小程序\archi_python_backend-main\archi_python_backend-main\static\buildings"

# 输出文件夹结构
print_folder_structure(folder_path)
