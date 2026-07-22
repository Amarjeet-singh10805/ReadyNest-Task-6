const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

const departments = [
  'Cardiology', 'Neurology', 'Orthopedics', 'Pediatrics',
  'Dermatology', 'Oncology', 'Gynecology', 'General Medicine'
];

const doctorData = [
  { firstName: 'James',       lastName: 'Wilson',   spec: 'Cardiology',       qual: 'MD, FACC',     exp: 15, fee: 500, lic: 'LIC001' },
  { firstName: 'Sarah',       lastName: 'Mitchell', spec: 'Neurology',        qual: 'MD, PhD',      exp: 12, fee: 450, lic: 'LIC002' },
  { firstName: 'Robert',      lastName: 'Chen',     spec: 'Orthopedics',      qual: 'MS Ortho',     exp: 10, fee: 400, lic: 'LIC003' },
  { firstName: 'Emily',       lastName: 'Davis',    spec: 'Pediatrics',       qual: 'MD, FAAP',     exp: 8,  fee: 350, lic: 'LIC004' },
  { firstName: 'Michael',     lastName: 'Brown',    spec: 'Dermatology',      qual: 'MD, Derm',     exp: 11, fee: 380, lic: 'LIC005' },
  { firstName: 'Jessica',     lastName: 'Lee',      spec: 'Oncology',         qual: 'MD, Onco',     exp: 14, fee: 600, lic: 'LIC006' },
  { firstName: 'David',       lastName: 'Taylor',   spec: 'Gynecology',       qual: 'MD, OBG',      exp: 9,  fee: 420, lic: 'LIC007' },
  { firstName: 'Jennifer',    lastName: 'Anderson', spec: 'General Medicine', qual: 'MBBS, MD',     exp: 7,  fee: 300, lic: 'LIC008' },
  { firstName: 'Christopher', lastName: 'Martin',   spec: 'Cardiology',       qual: 'MD, DM',       exp: 13, fee: 550, lic: 'LIC009' },
  { firstName: 'Amanda',      lastName: 'White',    spec: 'Neurology',        qual: 'MD, DM Neuro', exp: 6,  fee: 430, lic: 'LIC010' },
];

const genders    = ['MALE', 'FEMALE', 'OTHER'];
const bloods     = ['A_POSITIVE', 'A_NEGATIVE', 'B_POSITIVE', 'B_NEGATIVE', 'O_POSITIVE', 'O_NEGATIVE', 'AB_POSITIVE', 'AB_NEGATIVE'];
const statuses   = ['SCHEDULED', 'CONFIRMED', 'COMPLETED', 'CANCELLED'];
const firstNames = ['Alice','Bob','Carol','Daniel','Eve','Frank','Grace','Henry','Iris','Jack',
  'Karen','Liam','Maria','Nathan','Olivia','Peter','Quinn','Rachel','Sam','Tina',
  'Uma','Victor','Wendy','Xavier','Yara','Zack','Anna','Brian','Clara','Derek',
  'Elena','Felix','Gina','Hugo','Ines','Joel','Kate','Luke','Mia','Noah',
  'Opal','Paul','Rita','Seth','Tara','Umar','Vera','Will','Xena','Yusuf'];
const lastNames  = ['Smith','Jones','Williams','Taylor','Brown','Davies','Evans','Wilson','Thomas',
  'Roberts','Johnson','Lee','Walker','Hall','Allen','Young','Hernandez','King',
  'Wright','Lopez','Hill','Scott','Green','Adams','Baker','Nelson','Carter',
  'Mitchell','Perez','Parker'];

async function main() {
  console.log('🌱 Seeding database...\n');

  // Wipe everything in dependency order
  await prisma.prescriptionItem.deleteMany();
  await prisma.prescription.deleteMany();
  await prisma.bill.deleteMany();
  await prisma.appointment.deleteMany();
  await prisma.doctor.deleteMany();
  await prisma.patient.deleteMany();
  await prisma.user.deleteMany();
  await prisma.department.deleteMany();
  console.log('🗑  Cleared existing data\n');

  const password = await bcrypt.hash('Admin@123', 12);

  // Admin
  await prisma.user.create({
    data: {
      email: 'admin@hms.com',
      password,
      firstName: 'System',
      lastName: 'Admin',
      role: 'ADMIN',
    },
  });
  console.log('✅ Admin created  →  admin@hms.com  /  Admin@123');

  // Receptionist
  await prisma.user.create({
    data: {
      email: 'reception@hms.com',
      password,
      firstName: 'Mary',
      lastName: 'Johnson',
      role: 'RECEPTIONIST',
    },
  });
  console.log('✅ Receptionist created  →  reception@hms.com  /  Admin@123');

  // Departments
  const depts = [];
  for (const name of departments) {
    const d = await prisma.department.create({ data: { name } });
    depts.push(d);
  }
  console.log('✅ Departments created:', depts.map(d => d.name).join(', '));

  // Doctors
  const doctors = [];
  for (let i = 0; i < doctorData.length; i++) {
    const d    = doctorData[i];
    const dept = depts.find(dep => dep.name === d.spec) || depts.find(dep => dep.name === 'General Medicine');

    const userRecord = await prisma.user.create({
      data: {
        email:     `${d.firstName.toLowerCase()}.${d.lastName.toLowerCase()}@hms.com`,
        password,
        firstName: d.firstName,
        lastName:  d.lastName,
        role:      'DOCTOR',
        phone:     `+155500${String(i).padStart(4, '0')}`,
      },
    });

    const doc = await prisma.doctor.create({
      data: {
        userId:          userRecord.id,
        departmentId:    dept.id,
        specialization:  d.spec,
        qualification:   d.qual,
        experience:      d.exp,
        consultationFee: d.fee,
        licenseNumber:   d.lic,
        availableDays:   'MON,TUE,WED,THU,FRI',
        startTime:       '09:00',
        endTime:         '17:00',
      },
    });

    doctors.push(doc);
    console.log(`  ✔ Dr. ${d.firstName} ${d.lastName}  (${d.spec})  →  ${userRecord.email}`);
  }
  console.log(`\n✅ ${doctors.length} Doctors created\n`);

  // Patients
  const patients = [];
  for (let i = 0; i < 50; i++) {
    const fn = firstNames[i % firstNames.length];
    const ln = lastNames[i % lastNames.length];

    const userRecord = await prisma.user.create({
      data: {
        email:     `patient${i + 1}@hms.com`,
        password,
        firstName: fn,
        lastName:  ln,
        role:      'PATIENT',
        phone:     `+144400${String(i).padStart(4, '0')}`,
      },
    });

    const pat = await prisma.patient.create({
      data: {
        userId:         userRecord.id,
        gender:         genders[i % genders.length],
        bloodGroup:     bloods[i % bloods.length],
        dateOfBirth:    new Date(1970 + (i % 40), i % 12, (i % 28) + 1),
        address:        `${100 + i} Main St, City ${i % 10}`,
        emergencyName:  `Emergency Contact ${i}`,
        emergencyPhone: `+133300${String(i).padStart(4, '0')}`,
        emergencyRel:   'Spouse',
      },
    });

    patients.push(pat);
  }
  console.log(`✅ ${patients.length} Patients created`);

  // Appointments
  const appointments = [];
  for (let i = 0; i < 100; i++) {
    const patient = patients[i % patients.length];
    const doctor  = doctors[i % doctors.length];

    const daysOffset = i < 60 ? -(i % 30) : (i % 20) + 1;
    const date = new Date();
    date.setDate(date.getDate() + daysOffset);
    date.setHours(9 + (i % 8), (i % 2) * 30, 0, 0);

    const isPast = daysOffset <= 0;
    const status = isPast ? statuses[i % 4] : 'SCHEDULED';
    const fee    = Number(doctor.consultationFee);

    const appt = await prisma.appointment.create({
      data: {
        patientId:   patient.id,
        doctorId:    doctor.id,
        scheduledAt: date,
        status,
        fee,
        reason:   'Regular checkup',
        type:     'CONSULTATION',
        duration: 30,
      },
    });

    appointments.push(appt);
  }
  console.log(`✅ ${appointments.length} Appointments created`);

  // Prescriptions
  const completed = appointments.filter(a => a.status === 'COMPLETED');
  let rxCount = 0;
  for (const appt of completed.slice(0, 30)) {
    await prisma.prescription.create({
      data: {
        appointmentId: appt.id,
        patientId:     appt.patientId,
        doctorId:      appt.doctorId,
        diagnosis:     'Hypertension, mild',
        symptoms:      'Headache, dizziness',
        notes:         'Rest well, avoid stress',
        medications: {
          create: [
            {
              medicineName: 'Amlodipine',
              dosage:       '5mg',
              frequency:    'Once daily',
              duration:     '30 days',
              instructions: 'Take in the morning',
            },
            {
              medicineName: 'Paracetamol',
              dosage:       '500mg',
              frequency:    'Twice daily as needed',
              duration:     '7 days',
              instructions: 'After meals',
            },
          ],
        },
      },
    });
    rxCount++;
  }
  console.log(`✅ ${rxCount} Prescriptions created`);

  // Bills
  let billNum   = 1000;
  let billCount = 0;
  for (const appt of completed.slice(0, 50)) {
    const isPaid = Math.random() > 0.3;
    const fee    = Number(appt.fee);
    const total  = (fee + 150) * 1.05;

    await prisma.bill.create({
      data: {
        appointmentId: appt.id,
        patientId:     appt.patientId,
        billNumber:    `BILL-${billNum++}`,
        consultFee:    fee,
        medicinesFee:  150,
        tax:           5,
        totalAmount:   total,
        paidAmount:    isPaid ? total : 0,
        status:        isPaid ? 'PAID' : 'PENDING',
        paymentMethod: isPaid ? 'CASH' : null,
        paidAt:        isPaid ? new Date() : null,
      },
    });
    billCount++;
  }
  console.log(`✅ ${billCount} Bills created`);

  console.log('\n🎉 Seed complete!');
  console.log('─────────────────────────────────────────────────────');
  console.log('Role           Email                         Password');
  console.log('─────────────────────────────────────────────────────');
  console.log('Admin          admin@hms.com                 Admin@123');
  console.log('Doctor         james.wilson@hms.com          Admin@123');
  console.log('Patient        patient1@hms.com              Admin@123');
  console.log('Receptionist   reception@hms.com             Admin@123');
  console.log('─────────────────────────────────────────────────────');
}

main()
  .catch(e => { console.error('❌ Seed failed:', e); process.exit(1); })
  .finally(() => prisma.$disconnect());