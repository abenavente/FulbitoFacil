class SessionController < ApplicationController
  def new
  end
  
  def create
    customer = Customer.authenticate(params[:email], params[:password])
    if customer
      session[:customer_id] = customer.id
      redirect_to root_url, :notice => "Conectado"
    else
      flash.now.alert = "Cuenta invalida"
      render "new"
    end
  end
  
  def destroy
  session[:customer_id] = nil
  redirect_to root_url, :notice => "Desconectado"
  end

  def registro
    

  end

end
