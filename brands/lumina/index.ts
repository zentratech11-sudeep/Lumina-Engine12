import brand from "./brand.json";
import navigation from "./navigation.json";
import products from "./products.json";
import collections from "./collections.json";
import scene from "./scene.json";
import content from "./content.json";
import gallery from "./gallery.json";
import reviews from "./reviews.json";
import posts from "./blog.json";

/** Raw, unvalidated LUMINA data. Validation happens in lib/brand.ts. */
const lumina = { brand, navigation, products, collections, scene, content, gallery, reviews, posts };

export default lumina;
