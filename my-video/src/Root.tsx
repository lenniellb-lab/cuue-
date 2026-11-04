import { MyCompositionRoot } from "./Composition";
import { CartoonComposition } from "./cartoon/CartoonVideo";
import { PuppetComposition } from "./puppets/PuppetVideo";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <MyCompositionRoot />
      <CartoonComposition />
      <PuppetComposition />
    </>
  );
};
