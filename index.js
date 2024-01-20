const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const json2csv = require('json2csv');
const fs = require('fs');
const path = require('path');

const app = express();

app.use(express.json());
app.use(cors());

mongoose.connect('mongodb+srv://pavan:1234@cluster0.rr211vl.mongodb.net/?retryWrites=true&w=majority', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(()=>{
  try {
    console.log("connnected to database")
  } catch (error) {
    console.log("DB error")
  }
})

const employeeSchema = new mongoose.Schema({
  name: String,
  email: String,
  jobTitle: String,
});

const Employee = mongoose.model('Employee', employeeSchema);

app.post('/employees', async (req, res) => {
  try {
    const employee = new Employee(req.body);
    await employee.save();
    res.status(201).send(employee);
  } catch (error) {
    res.status(400).send(error);
  }
});

app.get('/employees', async (req, res) => {
  try {
    const employees = await Employee.find();
    res.send(employees);
  } catch (error) {
    res.status(500).send(error);
  }
});

app.delete('/employees/:id', async (req, res) => {
    try {
      const deletedEmployee = await Employee.findByIdAndDelete(req.params.id);
      if (!deletedEmployee) {
        return res.status(404).send('Employee not found');
      }
      res.send(deletedEmployee);
    } catch (error) {
      res.status(500).send(error);
    }
  });

app.get('/download', async (req, res) => {
  try {
    const employees = await Employee.find({}, 'name email jobTitle');
    const csv = json2csv.parse(employees, {
      fields: ['name', 'email', 'jobTitle'],
      header: false,
    });
    const filePath = path.join(__dirname, 'employees.csv');
    fs.writeFileSync(filePath, csv);

    res.download(filePath, 'employees.csv', () => {
      fs.unlinkSync(filePath);
    });
  } catch (error) {
    res.status(500).send(error);
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
