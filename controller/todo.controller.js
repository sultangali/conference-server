import Todo from "../model/Todo.js";

export const create = async (req, res) => {
  try {
    const { title, description } = req.body
    const userId = req.userId
    const document = new Todo({
      title,
      description,
      userId
    })
    const todo = await document.save()
    res.status(200).json(todo)
  } catch (error) {
    res.status(500).json(error.message)
  }
}

export const all = async (req, res) => {
  try {
    const todo = await Todo.find().populate('user').exec()
    res.status(200).json(todo)
  } catch (error) {
    res.status(500).json(error.message)
  }
}

export const status = async (req, res) => {
  try {
    const { status } = req.body
    const id = req.params.id

    const task = await Todo.findById(id)

    await Todo.updateOne({
      _id: task._id
    }, {
      status
    })

    res.status(200).json({
      success: true
    })
  } catch (error) {
    res.status(500).json(error.message)
  }
}

export const update = async (req, res) => {
  try {

    const { title, description } = req.body
    const id = req.params.id

    const task = await Todo.findById(id)

    await Todo.updateOne({
      _id: task._id
    }, {
      title,
      description
    })

    res.status(200).json({
      success: true
    })

  } catch (error) {
    res.status(500).json(error.message)
  }
}

export const remove = async (req, res) => {
  try {
    const id = req.params.id;

    const doc = await Todo.findOneAndDelete({ _id: id });

    if (!doc) {
      return res.status(404).json({
        message: "Todo not found",
      });
    }

    res.status(200).json({
      success: true,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error when deleting todo",
      error: error.message,
    });
  }
};
