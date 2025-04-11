/**
 * OpenFGA Authorization Model
 */

const authorizationModel = {
  type_definitions: [
    {
      type: "user",
      relations: {},
      metadata: {
        relations: {}
      }
    },
    {
      type: "system",
      relations: {
        admin: {
          this: {}
        },
        exists: {
          this: {}
        }
      },
      metadata: {
        relations: {
          admin: {
            directly_related_user_types: [
              {
                type: "user"
              }
            ]
          },
          exists: {
            directly_related_user_types: [
              {
                type: "tenant"
              }
            ]
          }
        }
      }
    },
    {
      type: "tenant",
      relations: {
        admin: {
          this: {}
        },
        member: {
          this: {}
        },
        exists: {
          this: {}
        }
      },
      metadata: {
        relations: {
          admin: {
            directly_related_user_types: [
              {
                type: "user"
              }
            ]
          },
          member: {
            directly_related_user_types: [
              {
                type: "user"
              }
            ]
          },
          exists: {
            directly_related_user_types: [
              {
                type: "tenant"
              }
            ]
          }
        }
      }
    },
    {
      type: "log",
      relations: {
        admin: {
          this: {}
        },
        read: {
          union: {
            child: [
              {
                this: {}
              },
              {
                computedUserset: {
                  object: "",
                  relation: "admin"
                }
              }
            ]
          }
        },
        write: {
          union: {
            child: [
              {
                this: {}
              },
              {
                computedUserset: {
                  object: "",
                  relation: "admin"
                }
              }
            ]
          }
        }
      },
      metadata: {
        relations: {
          admin: {
            directly_related_user_types: [
              {
                type: "user"
              }
            ]
          },
          read: {
            directly_related_user_types: [
              {
                type: "user"
              }
            ]
          },
          write: {
            directly_related_user_types: [
              {
                type: "user"
              }
            ]
          }
        }
      }
    },
    {
      type: "api_key",
      relations: {
        admin: {
          this: {}
        },
        read: {
          union: {
            child: [
              {
                this: {}
              },
              {
                computedUserset: {
                  object: "",
                  relation: "admin"
                }
              }
            ]
          }
        },
        write: {
          union: {
            child: [
              {
                this: {}
              },
              {
                computedUserset: {
                  object: "",
                  relation: "admin"
                }
              }
            ]
          }
        }
      },
      metadata: {
        relations: {
          admin: {
            directly_related_user_types: [
              {
                type: "user"
              }
            ]
          },
          read: {
            directly_related_user_types: [
              {
                type: "user"
              }
            ]
          },
          write: {
            directly_related_user_types: [
              {
                type: "user"
              }
            ]
          }
        }
      }
    }
  ]
};

module.exports = { authorizationModel };
