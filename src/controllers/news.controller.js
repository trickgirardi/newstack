import {
  createService,
  findAllService,
  countNewsService,
  topNewsService,
  findByIdService,
  searchByTitleService,
  byUserService,
  updateService,
  eraseService,
  likeNewsService,
  removeLikeNewsService,
  addCommentService,
  eraseCommentService,
} from "../services/news.service.js";

const create = async (req, res) => {
  try {
    const { title, text, banner } = req.body;

    if (!title || !text || !banner) {
      res.status(400).send({ message: "Submit all fields for creation" });
    }

    await createService({
      title,
      text,
      banner,
      user: req.userId,
    });

    res.sendStatus(201);
  } catch (err) {
    console.log("Error Database: ", err);
    res.status(500).send({ message: err.message });
  }
};
const findAll = async (req, res) => {
  let { limit, offset } = req.query;

  limit = Number(limit);
  offset = Number(offset);

  if (!limit) {
    limit = 5;
  }

  if (!offset) {
    offset = 0;
  }

  try {
    const news = await findAllService(offset, limit);
    const total = await countNewsService();
    const currentUrl = req.baseUrl;

    const next = offset + limit;
    const nextUrl =
      next < total ? `${currentUrl}?offset=${next}&limit=${limit}` : null;

    const previous = offset - limit < 0 ? null : offset - limit;
    const previousUrl =
      previous != null
        ? `${currentUrl}?offset=${previous}&limit=${limit}`
        : null;

    if (news.length === 0) {
      return res.status(400).send({ message: "There are no news" });
    }

    res.send({
      nextUrl,
      previousUrl,
      limit,
      offset,
      total,

      results: news.map((item) => ({
        id: item._id,
        title: item.title,
        text: item.text,
        banner: item.banner,
        likes: item.likes,
        comments: item.comments,
        name: item.user.name,
        username: item.user.username,
        userAvatar: item.user.avatar,
      })),
    });
  } catch (err) {
    console.log("Error Database: ", err);
    return res.status(500).send({ message: err.message });
  }
};

const topNews = async (req, res) => {
  try {
    const news = await topNewsService();

    if (!news) {
      return res.status(400).send({ message: "There are no news" });
    }

    res.send({
      news: {
        id: news._id,
        title: news.title,
        text: news.text,
        banner: news.banner,
        likes: news.likes,
        comments: news.comments,
        name: news.user.name,
        username: news.user.username,
        userAvatar: news.user.avatar,
      },
    });
  } catch (err) {
    console.log("Error Database: ", err);
    return res.status(500).send({ message: err.message });
  }
};

const findById = async (req, res) => {
  try {
    const { id } = req.params;

    const news = await findByIdService(id);

    return res.send({
      news: {
        id: news._id,
        title: news.title,
        text: news.text,
        banner: news.banner,
        likes: news.likes,
        comments: news.comments,
        name: news.user.name,
        username: news.user.username,
        userAvatar: news.user.avatar,
      },
    });
  } catch (err) {
    console.log("Error Database: ", err);
    return res.status(500).send({ message: err.message });
  }
};

const searchByTitle = async (req, res) => {
  try {
    const { title } = req.query;

    const news = await searchByTitleService(title);

    if (news.length === 0) {
      return res
        .status(400)
        .send({ message: "There are no news with this title" });
    }

    return res.send({
      results: news.map((item) => ({
        id: item._id,
        title: item.title,
        text: item.text,
        banner: item.banner,
        likes: item.likes,
        comments: item.comments,
        name: item.user.name,
        username: item.user.username,
        userAvatar: item.user.avatar,
      })),
    });
  } catch (err) {
    console.log("Error Database: ", err);
    return res.status(500).send({ message: err.message });
  }
};

const byUser = async (req, res) => {
  try {
    const id = req.userId;
    console.log(id);
    const news = await byUserService(id);

    return res.send({
      results: news.map((item) => ({
        id: item._id,
        title: item.title,
        text: item.text,
        banner: item.banner,
        likes: item.likes,
        comments: item.comments,
        name: item.user.name,
        username: item.user.username,
        userAvatar: item.user.avatar,
      })),
    });
  } catch (err) {
    console.log("Error Database: ", err);
    return res.status(500).send({ message: err.message });
  }
};

const update = async (req, res) => {
  try {
    const { title, text, banner } = req.body;
    const { id } = req.params;

    if (!title && !text && !banner) {
      res.status(400).send({ message: "Submit at least one field for update" });
    }

    const news = await findByIdService(id);

    if (news.user._id != req.userId) {
      return res.status(401).send({ message: "Unauthorized to update post" });
    }

    await updateService(id, title, text, banner);

    return res.send({ message: "News successfully updated" });
  } catch (err) {
    console.log("Error Database: ", err);
    return res.status(500).send({ message: err.message });
  }
};

const erase = async (req, res) => {
  try {
    const { id } = req.params;

    const news = await findByIdService(id);

    if (news.user._id != req.userId) {
      return res.status(401).send({ message: "Unauthorized to delete post" });
    }

    await eraseService(id);

    return res.send({ message: "News successfully deleted" });
  } catch (err) {
    console.log("Error Database: ", err);
    return res.status(500).send({ message: err.message });
  }
};

const likeNews = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    const newsLiked = await likeNewsService(id, userId);

    if (!newsLiked) {
      await removeLikeNewsService(id, userId);
      return res.status(200).send({
        message: "News successfully unliked",
      });
    }

    res.send({
      message: "News successfully liked",
    });
  } catch (err) {
    console.log("Error Database: ", err);
    return res.status(500).send({ message: err.message });
  }
};

const addComment = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;
    const { comment } = req.body;

    if (!comment) {
      return res.status(400).send({ message: "Write something to comment" });
    }

    await addCommentService(id, comment, userId);

    res.send({
      message: "Comment successfully added",
    });
  } catch (err) {
    console.log("Error Database: ", err);
    return res.status(500).send({ message: err.message });
  }
};

const eraseComment = async (req, res) => {
  try {
    const { idNews, idComment } = req.params;
    const userId = req.userId;

    const commentDeleted = await eraseCommentService(idNews, idComment, userId);

    const commentFinder = commentDeleted.comments.find(
      (comment) => comment.idComment === idComment,
    );

    if (!commentFinder) {
      return res.status(400).send({ message: "Comment not found" });
    }

    if (commentFinder.userId !== userId) {
      return res
        .status(401)
        .send({ message: "Unauthorized to delete comment" });
    }

    res.send({
      message: "Comment successfully deleted",
    });
  } catch (err) {
    console.log("Error Database: ", err);
    return res.status(500).send({ message: err.message });
  }
};

export {
  create,
  findAll,
  topNews,
  findById,
  searchByTitle,
  byUser,
  update,
  erase,
  likeNews,
  addComment,
  eraseComment,
};
