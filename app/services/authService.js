// const User = require('../models/User');
// const { getRoleByName} = require('./role.service');

// const registerUser = async (data) => {
//     const { name, emailId, mobileNo, city, state, password, role } = data;
//     const [firstName, lastName] = name.split(' ');

//     const Role = await getRoleByName("customer");

//     if(!Role) {
//         throw new Error('Role not found');
//     }

//     const newUser = new User({
//         firstName,
//         lastName,
//         emailId,
//         mobileNo,
//         city,
//         state,
//         password,
//         Role: Role._id
//     });
//     return await newUser.save();
// };

// module.exports = { registerUser };