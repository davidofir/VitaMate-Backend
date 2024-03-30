const express = require('express');
const passport = require('passport');
const router = express.Router();
const {createDrug,deleteDrug,getDrugByName} = require('../services/drugService')
router.use(express.json());
const bodyParser = require('body-parser');
router.use((bodyParser.json({ limit: '10mb' })));
router.get('/drug/:drugName', async (req, res) => {
    const { drugName } = req.params;

    try {
        const foundDrug = await getDrugByName(drugName);
        if (!foundDrug) {
            return res.status(404).send({ message: 'Drug not found.' });
        }
        const modifiedDrug = Object.entries(foundDrug).reduce((acc, [key, value]) => {
            
            if (key === '_id') {
                acc['name'] = value;
            } else {
                acc[key] = Buffer.from(value, 'base64').toString('utf-8').replace('\n','');
            }
            return acc;
        }, {});

        res.status(200).send(modifiedDrug);
    } catch (error) {
        console.error('Error fetching drug:', error);
        res.status(500).send({ error: 'Internal server error.' });
    }
});

router.post('/drug', async (req, res) => {
    const {
        name,
        purpose,
        warnings,
        doNotUse,
        usage,
        dosage,
        askDoctor,
        questions
    } = req.body.data;

    
    if (!name) {
        return res.status(400).send({ error: 'Drug name is required.' });
    }

    try {
        const success = await createDrug(name, purpose, warnings, doNotUse, usage, dosage, askDoctor, questions);
        if (success) {
            res.status(201).send({ message: 'Drug created successfully.' });
        } else {
            res.status(400).send({ error: 'Drug could not be created. It may already exist.' });
        }
    } catch (error) {
        console.error('Error creating drug:', error);
        res.status(500).send({ error: 'Internal server error.' });
    }
});

router.delete('/drug/:drugName',async(req,res)=>{
    const {drugName} = req.params;
    const response = await deleteDrug(drugName);
    if(response){
        res.status(200).send({message:`Drug ${drugName} deleted successfully`});
    }else{
        res.status(404).send({error: 'Drug not found'})
    }
})

module.exports = router;