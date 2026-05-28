export type { QnaCatalogEntry, QnaMatchContext } from "./types";
export { platformQnaQuestions } from "./catalog-questions";
export {
  getQuestionById,
  getQuestionsForBattery,
  getQuestionsForVehicle,
  getQuestionsForSearch,
  getQuestionsForCompare,
  getHomeFeaturedQuestions,
  HOME_FEATURED_QNA_IDS,
} from "./resolver";
