class AddPasswordConfirmationAndEmailConfirmationToOwner < ActiveRecord::Migration
  def change
    add_column :owners, :password_confirmation, :string

    add_column :owners, :email_confirmation, :string

  end
end
