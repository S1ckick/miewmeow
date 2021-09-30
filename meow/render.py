from openbabel import pybel
from openbabel import openbabel
import os
#complexes preparation
protein = next(pybel.readfile("pdbqt","2hnt.pdbqt"))
i = -1
protein.write("pdb","prot.pdb",True)
complexes = []
for ligand in pybel.readfile("pdbqt", "ligand_out.pdbqt"):
    pybel.Molecule(ligand.OBMol).write("pdb","lig"+str(i)+".pdb",True)
    receptor = pybel.Molecule(protein)
    receptor.OBMol += ligand.OBMol
    i = i + 1
    complexes.append(receptor.write("pdb"))
import requests
def push_and_get_link_to_render_complex(i):
    renderer_url = "http://127.0.0.1:8111/"
    response_url = requests.post(renderer_url + "putdata", json={"complex":complexes[i]})
    return response_url.text
for i in range(0,len(complexes)-1):
    print(push_and_get_link_to_render_complex(i))
