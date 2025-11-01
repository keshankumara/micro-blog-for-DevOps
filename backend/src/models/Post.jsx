import mongoose from 'mongoose'

const postSchema = new mongoose.Schema(
	{
		author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
		content: { type: String, required: true, maxlength: 1000 },
		likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
	},
	{ timestamps: true },
)

export default mongoose.model('Post', postSchema)
