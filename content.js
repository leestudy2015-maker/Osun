(function(window){
  const DEFAULT_CONTENT = {
    hero: {
      en: {
        title: 'Elegance. Confidence. Osun.',
        subtitle: 'Discover your radiance where fashion meets inner glow.',
        primaryCta: 'Shop Now',
        secondaryCta: 'Discover Our Story',
        primaryLink: '#shop',
        secondaryLink: 'about.html',
        image: 'hero.jpg'
      },
      zh: {
        title: '明亮自信．OSUN',
        subtitle: '在時尚與內在光芒之間，找到屬於你的自信。',
        primaryCta: '立即選購',
        secondaryCta: '了解品牌故事',
        primaryLink: '#shop',
        secondaryLink: 'about.html',
        image: 'hero.jpg'
      }
    },
    categories: {
      hero: {
        tag: {
          en: 'Curated Categories',
          zh: '精選分類'
        },
        title: {
          en: 'Dive into our boutique wardrobe library',
          zh: '滑動探索 OSUN 衣櫥圖書館'
        },
        subtitle: {
          en: 'Swipe through seasonal edits and uncover the looks that keep your style effortless.',
          zh: '沿著季節選輯滑動，找到讓造型輕鬆到位的每一套穿搭。'
        },
        ctaText: {
          en: 'Back to shop',
          zh: '返回精選商品'
        },
        ctaLink: 'index.html#shop'
      },
      sliderHint: {
        en: 'Swipe sideways to explore every look',
        zh: '左右滑動瀏覽更多造型'
      },
      groups: {
        wardrobe: {
          tag: {
            en: 'Wardrobe Foundations',
            zh: '衣櫥基礎'
          },
          title: {
            en: 'Everyday layers for your signature style.',
            zh: '打造每日儀式感的必備層次。'
          },
          description: {
            en: 'Mix-and-match staples that balance polish and comfort from office hours to weekend brunch.',
            zh: '從通勤到週末早午餐，兼顧舒適與俐落的混搭單品。'
          },
          items: [
            {
              id: 'wardrobe-1',
              price: 'MYR 289',
              image: 'product1.jpg',
              badge: {
                theme: 'rose',
                en: 'Best Seller',
                zh: '熱銷'
              },
              texts: {
                en: {
                  name: 'Lotus Wrap Dress',
                  description: 'Satin drape with adjustable waist ties and flutter sleeves.'
                },
                zh: {
                  name: 'Lotus 包裹洋裝',
                  description: '柔緞垂墜搭配可調腰帶與飄逸袖型。'
                }
              },
              inventory: {
                en: '12 pieces left',
                zh: '剩餘 12 件'
              }
            },
            {
              id: 'wardrobe-2',
              price: 'MYR 239',
              image: 'dress_pink.jpg',
              badge: {
                theme: 'amber',
                en: 'New',
                zh: '新品'
              },
              texts: {
                en: {
                  name: 'Citrine Co-ord Set',
                  description: 'Two-piece cotton set with cropped shirt and high-rise trousers.'
                },
                zh: {
                  name: 'Citrine 套裝',
                  description: '短版上衣與高腰長褲的輕棉兩件式。'
                }
              },
              inventory: {
                en: '18 sets available',
                zh: '現貨 18 套'
              }
            },
            {
              id: 'wardrobe-3',
              price: 'MYR 199',
              image: 'dress_black.jpg',
              badge: {
                theme: 'emerald',
                en: 'Restocked',
                zh: '重新上架'
              },
              texts: {
                en: {
                  name: 'Aura Pleat Skirt',
                  description: 'Weightless pleats with elastic comfort waistband.'
                },
                zh: {
                  name: 'Aura 百褶裙',
                  description: '極輕百褶搭配彈性腰頭，行走飄逸。'
                }
              },
              inventory: {
                en: '24 skirts ready',
                zh: '現貨 24 件'
              }
            },
            {
              id: 'wardrobe-4',
              price: 'MYR 259',
              image: 'store.jpg',
              badge: {
                theme: 'slate',
                en: 'Capsule',
                zh: '膠囊系列'
              },
              texts: {
                en: {
                  name: 'Layered Essentials Pack',
                  description: 'Cardigan, slip, and scarf trio curated for effortless layering.'
                },
                zh: {
                  name: '層次必備組',
                  description: '開襟衫、內襯與絲巾三件式，輕鬆堆疊造型。'
                }
              },
              inventory: {
                en: '9 sets remaining',
                zh: '剩餘 9 組'
              }
            }
          ]
        },
        ritual: {
          tag: {
            en: 'Lifestyle Rituals',
            zh: '生活儀式'
          },
          title: {
            en: 'Comfort-led looks for slow mornings and mindful evenings.',
            zh: '慢晨與夜晚儀式的舒適穿著。'
          },
          description: {
            en: 'Loungewear, weekend staples, and mindful textiles for every daily ritual.',
            zh: '居家套裝、週末單品與療癒材質，陪你完成日常儀式感。'
          },
          items: [
            {
              id: 'ritual-1',
              price: 'MYR 229',
              image: 'store.jpg',
              badge: {
                theme: 'rose',
                en: 'Limited',
                zh: '限量'
              },
              texts: {
                en: {
                  name: 'Velvet Dawn Robe',
                  description: 'Plush lounge robe with detachable sash and deep pockets.'
                },
                zh: {
                  name: 'Velvet Dawn 浴袍',
                  description: '柔軟絨面浴袍，附可拆腰帶與深口袋。'
                }
              },
              inventory: {
                en: '6 robes remaining',
                zh: '剩餘 6 件'
              }
            },
            {
              id: 'ritual-2',
              price: 'MYR 249',
              image: 'dress_pink.jpg',
              badge: {
                theme: 'amber',
                en: 'New',
                zh: '新品'
              },
              texts: {
                en: {
                  name: 'Weekend Glow Jumpsuit',
                  description: 'Relaxed-fit jumpsuit with breathable linen blend fabric.'
                },
                zh: {
                  name: 'Weekend Glow 連身褲',
                  description: '透氣亞麻混紡，寬鬆剪裁自在行動。'
                }
              },
              inventory: {
                en: '20 pieces stocked',
                zh: '現貨 20 件'
              }
            },
            {
              id: 'ritual-3',
              price: 'MYR 219',
              image: 'model1.png',
              badge: {
                theme: 'violet',
                en: 'Editor Pick',
                zh: '編輯推薦'
              },
              texts: {
                en: {
                  name: 'Sage Ritual Set',
                  description: 'Mindful knit top and culottes designed for stretch and breathability.'
                },
                zh: {
                  name: 'Sage Ritual 套裝',
                  description: '彈性針織上衣與寬褲，舒適透氣。'
                }
              },
              inventory: {
                en: '15 sets ready',
                zh: '現貨 15 套'
              }
            },
            {
              id: 'ritual-4',
              price: 'MYR 239',
              image: 'dress_black.jpg',
              badge: {
                theme: 'emerald',
                en: 'Restocked',
                zh: '重新上架'
              },
              texts: {
                en: {
                  name: 'Moonbeam Knit Dress',
                  description: 'Cozy rib-knit midi that drapes without clinging.'
                },
                zh: {
                  name: 'Moonbeam 針織洋裝',
                  description: '柔軟羅紋長洋裝，服貼不緊貼。'
                }
              },
              inventory: {
                en: '14 dresses in stock',
                zh: '現貨 14 件'
              }
            }
          ]
        },
        designer: {
          tag: {
            en: 'Designer Exclusives',
            zh: '設計師獨創'
          },
          title: {
            en: 'Statement eveningwear crafted for unforgettable nights.',
            zh: '專為晚宴時刻打造的高訂亮點。'
          },
          description: {
            en: 'Limited couture edits and bespoke gowns tailored by Southeast Asian designers.',
            zh: '東南亞設計師限量手作與量身禮服，綻放獨特光芒。'
          },
          items: [
            {
              id: 'designer-1',
              price: 'MYR 899',
              image: 'dress_black.jpg',
              badge: {
                theme: 'violet',
                en: 'Exclusive',
                zh: '獨家'
              },
              texts: {
                en: {
                  name: 'Aurora Beaded Gown',
                  description: 'Hand-applied beadwork with illusion neckline and dramatic train.'
                },
                zh: {
                  name: 'Aurora 手工珠鑽禮服',
                  description: '手工珠鑽與透膚領口，展現流線拖尾。'
                }
              },
              inventory: {
                en: '3 gowns remaining',
                zh: '剩餘 3 套'
              }
            },
            {
              id: 'designer-2',
              price: 'MYR 859',
              image: 'dress_pink.jpg',
              badge: {
                theme: 'rose',
                en: 'Limited',
                zh: '限量'
              },
              texts: {
                en: {
                  name: 'Celeste Column Dress',
                  description: 'Structured satin silhouette with detachable overskirt.'
                },
                zh: {
                  name: 'Celeste 直筒晚裝',
                  description: '雕塑感緞面剪裁，附可拆式外裙。'
                }
              },
              inventory: {
                en: '5 dresses available',
                zh: '現貨 5 套'
              }
            },
            {
              id: 'designer-3',
              price: 'MYR 949',
              image: 'model1.png',
              badge: {
                theme: 'slate',
                en: 'Couture',
                zh: '高訂'
              },
              texts: {
                en: {
                  name: 'Nocturne Cape Dress',
                  description: 'Sequinned cape overlay with minimalist slip base.'
                },
                zh: {
                  name: 'Nocturne 披肩洋裝',
                  description: '亮片披肩罩上極簡吊帶裙，低調華麗。'
                }
              },
              inventory: {
                en: '4 dresses left',
                zh: '剩餘 4 套'
              }
            },
            {
              id: 'designer-4',
              price: 'MYR 799',
              image: 'store.jpg',
              badge: {
                theme: 'emerald',
                en: 'Restocked',
                zh: '重新上架'
              },
              texts: {
                en: {
                  name: 'Obsidian Velvet Suit',
                  description: 'Tailored velvet tux with crystal lapel embellishments.'
                },
                zh: {
                  name: 'Obsidian 絲絨套裝',
                  description: '絲絨量身西裝，飾以水晶翻領細節。'
                }
              },
              inventory: {
                en: '2 suits remaining',
                zh: '剩餘 2 套'
              }
            }
          ]
        }
      }
    },
    about: {
      hero: {
        tag: {
          en: 'Our Founder Story',
          zh: '創辦人故事'
        },
        title: {
          en: 'Elegance rooted in community.',
          zh: '優雅源於社群。'
        },
        subtitle: {
          en: 'Osun began as a living room styling circle hosted by our founder, Madam Liyana Osman. Today we continue her tradition of personalised care with fashion and beauty that celebrates your glow.',
          zh: 'OSUN 由創辦人 Madam Liyana Osman 在客廳造型聚會中萌芽。今天，我們延續她的貼心服務，為你帶來專屬光芒的時尚與美妝。'
        },
        primaryCta: {
          en: 'Meet Madam Liyana',
          zh: '認識 Liyana 女士'
        },
        primaryLink: '#founder',
        secondaryCta: {
          en: 'Plan a visit',
          zh: '預約門市'
        },
        secondaryLink: 'index.html#visit'
      },
      founder: {
        tag: {
          en: 'Founder',
          zh: '創辦人'
        },
        title: {
          en: 'Meet Madam Liyana Osman',
          zh: '關於 Madam Liyana Osman'
        },
        story: {
          en: 'Raised in Klang, Madam Liyana blended her Peranakan heritage with contemporary styling to help women feel confident at every milestone. She believes beauty is a ritual of care, and each Osun appointment honours that ritual.',
          zh: '出生於巴生的 Liyana 女士結合娘惹文化與現代造型，陪伴女性在每個重要時刻展現自信。她相信美是日常儀式，每一次 OSUN 服務都向這份儀式致敬。'
        },
        quote: {
          en: '“When a woman feels seen, her glow is unstoppable. Osun exists to light that glow.”',
          zh: '「當一位女性被看見，她的光芒無可阻擋。OSUN 為此而存在。」'
        },
        highlights: [
          {
            en: '15+ years curating Southeast Asian designers.',
            zh: '15 年以上東南亞設計師策展經驗。'
          },
          {
            en: 'Certified beauty therapist and wardrobe stylist.',
            zh: '具備美容治療師與造型師雙重證照。'
          },
          {
            en: 'Hosts monthly glow circles for the Osun community.',
            zh: '每月舉辦 OSUN 社群光采聚會。'
          }
        ],
        image: 'model1.png',
        alt: {
          en: 'Madam Liyana Osman',
          zh: 'Liyana 女士'
        }
      },
      values: {
        tag: {
          en: 'Philosophy',
          zh: '品牌理念'
        },
        title: {
          en: 'Our guiding glow principles',
          zh: '我們的光采準則'
        },
        description: {
          en: 'Every collection, consultation, and event reflects the values Madam Liyana instilled in Osun.',
          zh: '每一季的商品、諮詢與活動都承載 Liyana 女士的品牌精神。'
        },
        items: [
          {
            title: {
              en: 'Intentional Craft',
              zh: '精心工藝'
            },
            description: {
              en: 'We partner with artisans and designers committed to fair practices and exquisite finishing.',
              zh: '與堅持公平製作、細膩手工的設計師合作。'
            }
          },
          {
            title: {
              en: 'Personal Rituals',
              zh: '專屬儀式'
            },
            description: {
              en: 'From custom fittings to facial mapping, every touchpoint is tailored to your lifestyle.',
              zh: '從量身試衣到臉部分析，每一步都貼合你的生活。'
            }
          },
          {
            title: {
              en: 'Community Glow',
              zh: '社群光芒'
            },
            description: {
              en: 'We create safe, inclusive spaces where women encourage each other to shine.',
              zh: '打造安全、包容的空間，彼此鼓勵綻放光彩。'
            }
          }
        ]
      },
      timeline: {
        tag: {
          en: 'Milestones',
          zh: '里程碑'
        },
        title: {
          en: 'How Osun blossomed',
          zh: 'OSUN 的成長軌跡'
        },
        description: {
          en: 'From humble beginnings to a beloved destination boutique, we continue to evolve with our community.',
          zh: '從溫馨的客廳到深受喜愛的精品門市，我們與社群一同成長。'
        },
        items: [
          {
            title: {
              en: '2010 · Living room fittings',
              zh: '2010 · 客廳試裝'
            },
            description: {
              en: 'Madam Liyana hosted intimate styling sessions for friends, testing fabrics and silhouettes tailored to Malaysian weather.',
              zh: 'Liyana 女士在家中與友人試布料、調整剪裁，打造適合大馬氣候的穿搭。'
            }
          },
          {
            title: {
              en: '2015 · Boutique opening',
              zh: '2015 · 門市開幕'
            },
            description: {
              en: 'Osun’s first storefront launched in Bayu Tinggi, combining fashion racks with a beauty treatment room.',
              zh: 'OSUN 首間門市落腳 Bayu Tinggi，結合時裝陳列與美妝護理室。'
            }
          },
          {
            title: {
              en: '2023 · Glow collective',
              zh: '2023 · Glow 社群'
            },
            description: {
              en: 'We introduced glow circles, wellness workshops, and digital styling appointments for global clients.',
              zh: '推出光采圈聚、身心靈工作坊與線上造型諮詢，服務全球客戶。'
            }
          }
        ]
      },
      community: {
        title: {
          en: 'Join the glow community',
          zh: '加入光采社群'
        },
        description: {
          en: 'RSVP to our upcoming masterclasses, seasonal lookbook launches, and founder-led conversations.',
          zh: '立即報名即將到來的大師課、季節型錄發佈與創辦人對談。'
        },
        ctaText: {
          en: 'Book an in-store session',
          zh: '預約門市體驗'
        },
        ctaLink: 'index.html#visit'
      }
    }
  };

  function cloneDefaults(){
    return JSON.parse(JSON.stringify(DEFAULT_CONTENT));
  }

  function deepMerge(target, source){
    if (!source) return target;
    const output = Array.isArray(target) ? [...target] : { ...target };
    if (Array.isArray(source)){
      return source.map(item => (typeof item === 'object' && item !== null ? deepMerge({}, item) : item));
    }
    Object.keys(source).forEach(key => {
      const value = source[key];
      if (value && typeof value === 'object' && !Array.isArray(value)){
        output[key] = deepMerge(target[key] || {}, value);
      } else {
        output[key] = value;
      }
    });
    return output;
  }

  function mergeWithDefaults(updates){
    const base = cloneDefaults();
    if (!updates) return base;
    const merge = (target, source) => {
      Object.keys(source).forEach(key => {
        const value = source[key];
        if (Array.isArray(value)){
          target[key] = value.map(item => {
            if (item && typeof item === 'object'){
              return deepMerge({}, item);
            }
            return item;
          });
        } else if (value && typeof value === 'object'){
          target[key] = merge(target[key] || {}, value);
        } else {
          target[key] = value;
        }
      });
      return target;
    };
    return merge(base, updates);
  }

  window.OSUN_CONTENT = {
    STORAGE_KEY: 'osun-content-config',
    DEFAULT: DEFAULT_CONTENT,
    clone: cloneDefaults,
    merge: mergeWithDefaults
  };
})(window);
