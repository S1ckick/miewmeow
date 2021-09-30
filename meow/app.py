from plip.structure.preparation import PDBComplex, BindingSite
Tasks = []

def findContacts(complex):
    my_mol = PDBComplex()
    my_mol.load_pdb(complex, as_string = True)
    my_mol.analyze()
    contacts = {}
    for my_interactions in my_mol.interaction_sets:
        contacts[my_interactions] = {}
        print(my_mol.interaction_sets[my_interactions].interacting_res)
        hydrophobic_contacts = my_mol.interaction_sets[my_interactions].hydrophobic_contacts
        pistacking_contacts = my_mol.interaction_sets[my_interactions].pistacking
        if len(hydrophobic_contacts) > 0:
            contacts[my_interactions]["hydrophobic"] = hydrophobic_contacts
        if len(pistacking_contacts) > 0:
            contacts[my_interactions]["pistacking"] = pistacking_contacts

    interactions = {}
    for bsite in contacts:
        interactions = {}
        for interaction_type in contacts[bsite]:
            if interaction_type == "hydrophobic":
                interactions[interaction_type] = []
                for hcontact in contacts[bsite][interaction_type]:
                    interactions[interaction_type].append([hcontact[1],hcontact[3]])
            elif interaction_type == "pistacking":
                interactions[interaction_type] = [contacts[bsite][interaction_type][0][0].center, contacts[bsite][interaction_type][0][1].center]
    return interactions

from flask import Flask, render_template, request, jsonify

app = Flask(__name__) #creating the Flask class object

@app.route('/render')
def home():
    task_id = request.args.get("task_id")
    my_complex = []
    hb = None
    if task_id != None:
        my_complex = Tasks[int(task_id)]["complex"]
    return render_template('index.html', my_complex = my_complex)



@app.route('/contacts', methods=['GET'])
def contact():
    task_id = request.args.get("task_id")
    hb = {}
    possible_contacts = ["hydrophobic", "pistacking"]
    current_contacts = [contact for contact in possible_contacts if request.args.get(contact) == "True"]
    if task_id != None:
        if len(current_contacts) > 0:
            if Tasks[int(task_id)]["is_contacts"] == False:
                print("first time")
                hb = findContacts(Tasks[int(task_id)]["complex"])
                Tasks[int(task_id)]["contacts"] = hb
                for contact in possible_contacts:
                    if contact not in Tasks[int(task_id)]["contacts"]:
                        Tasks[int(task_id)]["contacts"][contact] = []
                Tasks[int(task_id)]["is_contacts"] = True

            elif Tasks[int(task_id)]["is_contacts"] == True:
                print("NOT first time, just take from db")
                hb = Tasks[int(task_id)]["contacts"]
    result = {name : hb[name] for name in current_contacts}
    print(result)
    return result

import socket
def get_aws_address():
    return socket.gethostbyname(socket.gethostname())

@app.route('/putdata', methods=['POST'])
def putdata():
    mol_data = request.get_json()
    mol_data["is_contacts"] = False
    Tasks.append(mol_data)
    return "https://127.0.0.1:8111/render?task_id=" + str(len(Tasks)-1)

if __name__ =='__main__':
    app.run(host="0.0.0.0", port = 8111)