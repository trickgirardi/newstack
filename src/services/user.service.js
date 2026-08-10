import User from "../models/User.js";

const createService = (body) => User.create(body);

const findAllService = () => User.find();

const findByIdService = (id) => User.findById(id);

const updateService = (id, name, email, password, avatar, background) =>
  User.findOneAndUpdate(
    { _id: id },
    { name, email, password, avatar, background },
  );

export { createService, findAllService, findByIdService, updateService };
