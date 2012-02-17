class Usercustomer < ActiveRecord::Base
  # Include default devise modules. Others available are:
  # :token_authenticatable, :encryptble, :confirmable, :lockable, :timeoutable and :omniauthable
  devise :database_authenticatable, :registerable, :timeoutable,
         :recoverable, :rememberable, :trackable, :validatable ,:timeout_in => 20.seconds

  # Setup accessible (or protected) attributes for your model
  attr_accessible :email, :password, :password_confirmation, :remember_me

end
