Refer to - https://elassandra.readthedocs.io/en/latest/quickstart.html

# Installation
Follow https://docs.google.com/document/d/1DHHTLGvOSywmAel0U3pvZ8xejcWOPDJ8jl0wPKfr90U/edit?usp=sharing

-- This repository hierarchy is as below -

PSQL/cheerswisdom_obsolete.txt          -- Obsolete file
PSQL/docker-compose.yml                 -- Docker config to run 2 nodes of elasandra and 1 node of kibana
PSQL/wisdom_cassandra_phase1.txt        -- Phase 1 cassandra queries for table creation
PSQL/wisdom_cassandra_phase2.txt        -- Phase 2 cassandra queries for table creation
PSQL/wisdom_cassandra_phase3.txt        -- Phase 3 cassandra queries for table creation
PSQL/wisdom_es_phase1.txt               -- Phase 1 ES queries for index and mapping creation
PSQL/wisdom_es_phase2.txt               -- Phase 2 ES queries for index and mapping creation
PSQL/wisdom_es_phase3.txt               -- Phase 3 ES queries for index and mapping creation
PSQL/wisdom_query_phase2.txt            -- Data fetching for phase 2
PSQL/wisdom_query_phase3.txt            -- Data fetching for phase 3



** Below are the kibana queries

DELETE wisdom_expressions_comments

GET wisdom_users/_count

{
  "sort": [
    {
      "userid": {
        "order": "desc"
      }
    }
  ]
}

GET wisdom_users/_search
{
  "sort": [
    {
      "userid": {
        "order": "desc"
      }
    }
  ],
  "query": {
    "term": {
      "gender": {
        "value": "M"
      }
    }
  }
}

GET wisdom_users/_search
{
  "query": {
    "term": {
      "pincode": {
        "value": 500001
      }
    }
  }
}

GET wisdom_users/_search
{
  "query": {
    "range": {
      "dob": {
        "gte": "2001-01-01"
      }
    }
  }
}

DELETE wisdom_users_occupational_interest

POST wisdom_users/_update_by_query
{
  "query": {
    "term": {
      "lat": 222.22
    }
  },
  "script": {
    "source": "ctx._source.language = 'FR'",
    "lang": "painless"
  }
}

GET wisdom_users_friend_request/_count
{
  "query": {
    "bool": {
      "must": [
        {
          "term": {
            "to_user": {
              "value": "user3"
            }
          }
        },
        {
          "term": {
            "request_status": {
              "value": "Pending"
            }
          }
        }
      ]
    }
  }
}

GET wisdom_users_friend_request/_search
{
  "query": {
    "bool": {
      "must": [
        {
          "terms": {
            "from_user": [
              "user5",
              "user2"
            ]
          }
        },
        {
          "terms": {
            "to_user": [
              "user5","user2"
            ]
          }
        },
        {
          "term": {
            "request_status": "Accepted"
          }
        }
      ]
    }
  }
}

GET wisdom_users_friend_request/_search
{
  "query": {
    "bool": {
      "must": [
        {
          "term": {
            "request_status": {
              "value": "Accepted"
            }
          }
        }
      ], 
      "should": [
        {
          "term": {
            "from_user": "user2"
          }
        },
        {
          "term": {
            "to_user": "user2"
          }
        }
      ]
    }
  }
}


/* who has blocked me count */
GET wisdom_users_block/_search
{
  "query": {
    "term": {
      "to_user": {
        "value": "user2"
      }
    }
  }
}

/* How many users I have blocked */
GET wisdom_users_block/_count
{
  "query": {
    "term": {
      "from_user": {
        "value": "user2"
      }
    }
  }
}

/* Check whether a user is blocked by the other user */
GET wisdom_users_block/_count
{
  "query": {
    "bool": {
      "must": [
        {
          "term": {
            "from_user": {
              "value": "user3"
            }
          }
        },
        {
          "term": {
            "to_user": {
              "value": "user5"
            }
          }
        }
      ]
    }
  }
}

/* Check if users mutually blocked - if count == 2 */
GET wisdom_users_block/_count
{
  "query": {
    "bool": {
      "must": [
        {
          "terms": {
            "from_user": [
              "user4",
              "user7"
            ]
          }
        },
        {
          "terms": {
            "to_user": [
              "user4",
              "user7"
            ]
          }
        }
      ]
    }
  }
}


GET wisdom_users_block/_count
{
  "query": {
    "bool": {
      "must": [
        {
          "terms": {
            "from_user": [
              "user5",
              "user6",
              "user7"
            ]
          }
        },
        {
          "term": {
            "to_user": {
              "value": "user4"
            }
          }
        }
      ]
    }
  }
}

GET wisdom_users_block/_search
{
  "query": {
    "term": {
      "from_user": {
        "value": "user4"
      }
    }
  },
  "stored_fields": [
    "to_user"
  ]
}

GET wisdom_expressions/_count
{
  "query": {
    "term": {
      "situational_interest": {
        "value": "Interest1"
      }
    }
  }
}

GET wisdom_expressions/_search
{
  "query": {
    "bool": {
      "must_not": [
        {
          "term": {
            "user_id": {
              "value": "user1"
            }
          }
        }
      ],
      "must": [
        {
          "term": {
            "tags": {
              "value": "Tag1"
            }
          }
        }
      ]
    }
  }
}

GET wisdom_expressions/_search
{
  "size": 10,
  "from": 0, 
  
  "sort": [
    {
      "expression_id": {
        "order": "desc"
      }
    }
  ]
}

GET wisdom_expressions/_search
{
  "query": {
    "range": {
      "date_created": {
        "gte": "now-12M/d",
        "lte": "now"
      }
    }
  },
  "aggs": {
    "user_exp": {
      "terms": {
        "field": "user_id"
        
      },
      "aggs": {
        "top": {
          "top_hits": {
            "size": 10
          }
        }
      }
    }
  }
}

GET wisdom_expressions_likes/_count
GET wisdom_expressions_comments/_count
{
  "query": {
    "term": {
      "expression_id": {
        "value": "exp1"
      }
    }
  }
}

GET wisdom_expressions_comments/_search
{
    "size": 5,
    "from": 0, 
    "query": {
      "term": {
        "parent_id": {
          "value": "com1"
        }
      }
    },
    "sort": [
      {
        "comment_id": {
          "order": "asc"
        }
      }
    ]
  }

{
  "size": 5,
  "from": 0, 
  "query": {
    "term": {
      "expression_id": {
        "value": "exp1"
      }
    }
  },
  "sort": [
    {
      "comment_id": {
        "order": "asc"
      }
    }
  ]
}