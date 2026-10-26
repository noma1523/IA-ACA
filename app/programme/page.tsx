import { Catalogue } from "@/components/catalogue";
import { Intro, Notice } from "@/components/ui";
export const metadata = { title: "Le programme" };
export default function Programme() {
  return (
    <>
      <Intro
        eyebrow="LE PROGRAMME"
        title="Votre chemin vers une IA utile."
        text="22 modules, 132 leçons. Un parcours progressif pour comprendre, pratiquer et construire vos propres projets."
      />
      <Notice title="Vous partez de zéro ? Vous êtes au bon endroit.">
        Le module 02 est une remise à niveau numérique facultative. Vous pouvez
        le passer sans bloquer la suite de votre parcours.
      </Notice>
      <Catalogue />
    </>
  );
}
