// var express = require("express");
// var router = express.Router();
// const mongoose = require("mongoose");
// const Notes = require("../db/objective/notes");
// const ObjectId = mongoose.Types.ObjectId;
// const Organization = require("../db/organization");

// // router.param('noteid', async (req,res,next,noteid) => {
// //     if(!ObjectId.isValid(noteid)) {
// //         res.status(500).json({message: 'Invalid ID'});
// //     }
// //     else {
// //         if(await Notes.count({_id: noteid})) {
// //             req.noteid = noteid;
// //             next();
// //         }
// //         else {
// //             res.sendStatus(404);
// //         }
// //     }
// // });

// router.param("noteid", async (req, res, next, noteid) => {
//   if (!ObjectId.isValid(noteid)) {
//     res.status(500).json({ message: "Invalid noteID" });
//   } else {
//     let note = await Notes.findOne({ _id: noteid });
//     if (
//       note &&
//       note.clientID.toString() !== req.clientID &&
//       (req.method === "PUT" || req.method === "DELETE")
//     ) {
//       res.status(403).json({ message: "You are not authorized to edit this" });
//     } else if (note) {
//       req.noteid = noteid;
//       next();
//     } else {
//       res.sendStatus(404);
//     }
//   }
// });

// router.post("/", async (req, res, next) => {
//   try {
//     let note = new Notes({ ...req.body, clientID: req.clientID });
//     await note.save();
//     res.json(note);
//   } catch (err) {
//     next(err);
//   }
// });

// router.get("/", async (req, res, next) => {
//   try {
//     res.json(await Notes.find({ clientID: req.clientID }));
//   } catch (err) {
//     next(err);
//   }
// });

// router.get("/:noteid", async (req, res, next) => {
//   try {
//     let note = await Notes.findOne({
//       _id: req.noteid
//     });
//     note ? res.json(note) : res.sendStatus(404);
//   } catch (err) {
//     next(err);
//   }
// });

// router.put("/:noteid", async (req, res, next) => {
//   try {
//     let m = await Notes.updateOne(
//       {
//         _id: req.noteid,
//         clientID: req.clientID
//       },
//       req.body
//     );
//     m.n > 0 ? res.sendStatus(200) : res.sendStatus(404);
//   } catch (err) {
//     next(err);
//   }
// });

// router.patch("/:noteID/tags", async (req, res, next) => {
//   try {
//     const obj = await Notes.findOneAndUpdate(
//       { _id: req.params.noteID },
//       { $set: { tags: req.body.tags } },
//       { new: true }
//     );
//     if (req.body.newTag) {
//       const resp = await Organization.findOneAndUpdate(
//         { _id: req.user[0].organizationID },
//         { $addToSet: { tags: req.body.newTag } }
//       );
//     }
//     res.json(obj);
//   } catch (err) {
//     next(err);
//   }
// });

// router.delete("/:noteid", async (req, res, next) => {
//   try {
//     let m = await Notes.deleteOne({ _id: req.noteid, clientID: req.clientID });
//     m.n > 0 ? res.sendStatus(200) : res.sendStatus(404);
//   } catch (err) {
//     next(err);
//   }
// });

// module.exports = router;

var express = require("express");
var router = express.Router();
const mongoose = require("mongoose");
const Notes = require("../db/objective/notes");
const NoteFolders = require("../db/objective/noteFolders");
const ObjectId = mongoose.Types.ObjectId;
const Organization = require("../db/organization");

// router.param('noteid', async (req,res,next,noteid) => {
//     if(!ObjectId.isValid(noteid)) {
//         res.status(500).json({message: 'Invalid ID'});
//     }
//     else {
//         if(await Notes.count({_id: noteid})) {
//             req.noteid = noteid;
//             next();
//         }
//         else {
//             res.sendStatus(404);
//         }
//     }
// });

router.param("noteid", async (req, res, next, noteid) => {
  if (!ObjectId.isValid(noteid)) {
    res.status(500).json({ message: "Invalid noteID" });
  } else {
    let note = await Notes.findOne({ _id: noteid });
    if (
      note &&
      note.clientID.toString() !== req.clientID &&
      !note.shared.includes(req.clientID) &&
      (req.method === "PUT" || req.method === "DELETE")
    ) {
      res.status(403).json({ message: "You are not authorized to edit this" });
    } else if (note) {
      req.noteid = noteid;
      next();
    } else {
      res.sendStatus(404);
    }
  }
});

router.post("/", async (req, res, next) => {
  try {
    let note = new Notes({
      ...req.body,
      clientID: req.clientID,
      createDate: Date.now(),
    });
    await note.save();
    res.json(note);
  } catch (err) {
    next(err);
  }
});

router.get("/", async (req, res, next) => {
  try {
    // res.json(await Notes.find({ clientID: req.clientID }));
    let skip = 0,
      sort = 0,
      limit = 0;
    let createDate = new Date(8640000000000000);
    if (req.query.pageNo) {
      skip = req.query.pageNo * 3;
      limit = (req.query.pageNo + 1) * 3;
      sort = -1;
      createDate = new Date();
    }
    const notes = await Notes.find({
      $or: [{ clientID: req.clientID }, { shared: { $in: [req.clientID] } }],
      createDate: { $lt: createDate },
    })
      .skip(skip)
      .limit(limit)
      .sort({ createDate: sort });
    return res.json(notes);
  } catch (err) {
    next(err);
  }
});

router.get("/:noteid", async (req, res, next) => {
  try {
    let note = await Notes.findOne({
      _id: req.noteid,
    });
    note ? res.json(note) : res.sendStatus(404);
  } catch (err) {
    next(err);
  }
});

router.put("/:noteid", async (req, res, next) => {
  try {
    let m = await Notes.updateOne(
      {
        _id: req.noteid,
        // clientID: req.clientID,
      },
      req.body
    );
    m.n > 0 ? res.sendStatus(200) : res.sendStatus(404);
  } catch (err) {
    next(err);
  }
});

router.patch("/:noteID/tags", async (req, res, next) => {
  try {
    const obj = await Notes.findOneAndUpdate(
      { _id: req.params.noteID },
      { $set: { tags: req.body.tags } },
      { new: true }
    );
    if (req.body.newTag) {
      const resp = await Organization.findOneAndUpdate(
        { _id: req.user[0].organizationID },
        { $addToSet: { tags: req.body.newTag } }
      );
    }
    res.json(obj);
  } catch (err) {
    next(err);
  }
});

router.delete("/:noteid", async (req, res, next) => {
  try {
    let m = await Notes.deleteOne({ _id: req.noteid, clientID: req.clientID });
    m.n > 0 ? res.sendStatus(200) : res.sendStatus(404);
  } catch (err) {
    next(err);
  }
});

//Note Folders

router.get("/folders/:orgID/user/:userID", async (req, res, next) => {
  try {
    const folders = await NoteFolders.find({
      orgID: req.params.orgID,
      user: req.params.userID,
    });
    res.json(folders);
  } catch (err) {
    next(err);
  }
});

router.post("/folders/:orgID/user/:userID", async (req, res, next) => {
  try {
    const folder = new NoteFolders({
      orgID: req.params.orgID,
      name: req.query.name,
      user: req.params.userID,
    });
    const newFolder = await folder.save();
    if (newFolder) {
      folders = await NoteFolders.find({
        orgID: req.params.orgID,
        user: req.params.userID,
      });
      res.json(folders);
    }
  } catch (err) {
    next(err);
  }
});

router.patch("/folders/:folderID", async (req, res, next) => {
  try {
    const folder = await NoteFolders.findOneAndUpdate(
      { _id: req.params.folderID },
      { name: req.body.name }
    );
    res.json(folder);
  } catch (err) {
    next(err);
  }
});

//Shared Notes

router.patch("/:noteid/share", async (req, res, next) => {
  try {
    let m = await Notes.findOneAndUpdate(
      {
        _id: req.noteid,
        clientID: req.clientID,
      },
      {
        $set: {
          shared: req.body.shared,
          allowEdit: req.body.allowEdit,
          message: req.body.message,
        },
      }
    );
    res.json(m);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
