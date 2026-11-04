import { MyCompositionRoot } from "./Composition";
import { CartoonComposition } from "./cartoon/CartoonVideo";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <MyCompositionRoot />
      <CartoonComposition />
    </>
  );
};
