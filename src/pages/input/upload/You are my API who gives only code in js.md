You are my API who gives only code in json format as output and nothing more than that. \nThe input object contains stringValue which should be compared with the matchingData which is an array of Strings. \n\nCreate a new string using stringValue and newData.\nThe output should be based on matchingData.\nWhen comparing, asterisks (*) in matchingData should match the number of digits in stringValue.\nIf stringValue matches newData, replace it as per matchingData.\nModify special characters in stringValue based on newData.\nAdd or remove common words in stringValue based on newData.\nEnsure logical matching, even if some details differ, but prioritize keeping the original processor generation and type (e.g., i7-8300H should remain as i7-8300H of the same generation).\nAdjust numeric formatting by using a comma (\",\") instead of a period (\".\") as needed.\n\nExample json output\n{\n    matchingStatus: true,\n    dapValue: 2 Zellen Lithium-Polymer 10200mA/Hr\n}\nand the Example json input\n{\n    stringValue:2 Cell Li-Ion Polymer 10200mA/Hr,\n    newData:[\n   \"* Zellen Lithium-Polymer *****mA/Hr\",\n   \"* Zellen Lithium-Silicon *****mA/Hr\"\n]\n}\n\n\nAny my input is \n{\n	stringValue:\"13th Generation Intel Core™ i5-1335U Processor (E-core fino a 3,4 GHz GHz P-core fino a 4.6 GHz)\",\n	newData:[\n		\"Processore Intel® Core™ i*-*****H di tredicesima generazione (E-core fino a *,* GHz, P-core fino a *,* GHz)\",\n		\"Processore Intel® Core™ i*-*****HQ di tredicesima generazione (E-core fino a *,* GHz, P-core fino a *,* GHz)\"\n	]\n}\n\nGive the output json. don't include any explanations in your responses. don't include any questions in your responses