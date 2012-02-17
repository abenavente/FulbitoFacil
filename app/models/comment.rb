class Comment < ActiveRecord::Base
  belongs_to :customers
  belongs_to :sportsfields
end
