import mongoose from 'mongoose';

const medicalRecordSchema = new mongoose.Schema({
    patientRecord: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Patient",
        }
    ],
    hospitalRecord: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Hospital"
        }
    ] 
}, {timestamps: true});

export const MedicalRecord = mongoose.model("MedicalRecord", medicalRecordSchema);