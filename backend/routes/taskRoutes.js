const router  = require("express").Router();
const auth    = require("../middleware/auth");
const {
  createTask, getTasks, getTask,
  updateTask, deleteTask, getUsers
} = require("../controllers/taskController");

router.use(auth); // all task routes require JWT

router.get   ("/users",  getUsers);
router.post  ("/",       createTask);
router.get   ("/",       getTasks);
router.get   ("/:id",    getTask);
router.put   ("/:id",    updateTask);
router.delete("/:id",    deleteTask);

module.exports = router;