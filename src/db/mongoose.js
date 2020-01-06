const mongoose = require('mongoose');
const validator = require('validator');

mongoose.connect(process.env.MONGODB_URL,{
	useNewUrlParser: true,
	useUnifiedTopology: true,
	useCreateIndex: true,
	useFindAndModify: false
})

/*const Tasks = mongoose.model('Tasks',{
	description: {
		type: String
	},
	completed: {
		type: Boolean
	}
})

const task = new Tasks({
	description: 'Do th dishes',
	completed: false
})

task.save().then(()=>{
	console.log('Task added!');
}).catch((error)=>{
	console.log('Error', error);
})*/


