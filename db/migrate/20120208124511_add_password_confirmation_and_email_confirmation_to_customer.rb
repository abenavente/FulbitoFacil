class AddPasswordConfirmationAndEmailConfirmationToCustomer < ActiveRecord::Migration
  def change
    add_column :customers, :password_confirmation, :string

    add_column :customers, :email_confirmation, :string

  end
end
