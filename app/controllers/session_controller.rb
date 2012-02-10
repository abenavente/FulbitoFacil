class SessionController < ApplicationController
  def new
  end
  
  def create
    customer = Customer.authenticate(params[:email], params[:password])
    if customer
      session[:customer_id] = customer.id
      redirect_to root_url, :notice => "Logged in!"
    else
      flash.now.alert = "Invalid email or password"
      render "new"
    end
  end
  
  def destroy
  session[:customer_id] = nil
  redirect_to root_url, :notice => "Logged out!"
  end

end
