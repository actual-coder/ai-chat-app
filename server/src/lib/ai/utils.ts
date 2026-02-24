import { models } from "./models";
import { ModelCompanyType, ModelType } from "./types";

const getModel = (model: ModelType) => models[model];

const getModelProvider = (model: ModelType): ModelCompanyType => {
  return models[model].provider;
};

export { getModel, getModelProvider };
