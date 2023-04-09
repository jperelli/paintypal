import { Configuration, OpenAIApi } from "openai";

const palettes = [
  {
    name: "QOR - Introductory 6 set",
    slug: "qor",
    colors: [
      "Hansa Yellow Light", "Phthalo Blue (GS)", "Ultramarine Blue", "Pyrrole Red Light", "Permanent Alizarin Crimson", "Burnt Sienna (Natural)"
    ]
  },
  {
    name: "Daniel Smith - Essentials set",
    slug: "daniel-smith",
    colors: [
      "Hansa Yellow Light", "Quinacridone Rose", "Pthalo Blue Green Shade", "New Gamboge", "Pyrrol Scarlet", "French Ultramarine"
    ]
  },
  {
    name: "White Nights - Set botanica",
    slug: "white-nights",
    colors: [
      "Cadmium Yellow Medium", "Ochre Light", "Orange", "Cadmium Red Light", "Geranium Red", "Madder Lake Red", "Quinacridone Violet", "Ultramarine Deep", "Bright Blue", "Emerald Green", "May Green", "Sepia"
    ]
  },
  {
    name: "Winsor & Newton - Cotman set",
    slug: "winsor-newton",
    colors: [
      "Lemon Yellow Hue", "Cadmium Yellow Hue", "Cadmium Red Pale Hue", "Permanent Rose", "Ultramarine", "Cerulean Blue Hue", "Viridian Hue", "Sap Green", "Burnt Sienna", "Burnt Umber", "Lamp Black", "Chinese White"
    ]
  },
  {
    name: "Kuretake - Gansai Tambi Nuance",
    slug: "kuretake",
    colors: [
      "Natural Beige", "Rose Beige", "Lilac", "Cherry Blossom Pink", "Greenish Yellow", "Lime Green", "Horizon Blue", "Cobalt Blue", "Blue Gray Deep", "Indian Red", "Maroon", "Gray"
    ]
  },
]


export async function POST(request: Request) {
  // check that request comes with paramenter "color" and "palette"
  const { color, palette } = await request.json();
  if (!color || color === "undefined") {
    return new Response("Missing color parameter", { status: 400 });
  }
  if (!palette || palette === "undefined") {
    return new Response("Missing palette parameter", { status: 400 });
  }

  // check that palette is valid
  const paletteObj = palettes.find(p => p.slug === palette);
  if (!paletteObj) {
    return new Response("Invalid palette", { status: 400 });
  }

  const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
  });
  
  const openai = new OpenAIApi(configuration);
  try {
    const res = await openai.createChatCompletion({
      model:"gpt-3.5-turbo",
      messages:[
        {"role": "system", "content": "You are a color mix expert."},
        {"role": "user", "content": `Put a name to RGB ${color}. Give me short concise instructions to mix colors to form it, using the palette "${paletteObj.name}: ${paletteObj.colors.join(", ")}".`}
      ],
      'max_tokens': 200,

    })

    return new Response(res.data.choices[0].message?.content, { status: 200 });
  }
  catch (e) {
    console.log(e!.toString())
    return new Response(e!.toString(), { status: 500 });
  }
}
