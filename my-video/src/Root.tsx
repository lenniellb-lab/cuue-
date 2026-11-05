import { MyCompositionRoot } from "./Composition";
import { CartoonComposition } from "./cartoon/CartoonVideo";
import { PuppetComposition } from "./puppets/PuppetVideo";
import { ToonComposition } from "./toon/ToonVideo";
import { CineComposition } from "./cine/CineVideo";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <MyCompositionRoot />
      <CartoonComposition />
      <PuppetComposition />
      <ToonComposition />
      <CineComposition />
    </>
  );
};
