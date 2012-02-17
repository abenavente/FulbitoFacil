class ApplicationController < ActionController::Base
  protect_from_forgery
  helper_method :current_customer 
  
  private
  #def current_customer
   # @current_customer ||= Customer.find(session[:customer_id]) if session[:customer_id]
  #end

  #def current_owner
   # @current_owner ||= Owner.find(session[:owner_id]) if session[:owner_id]
  #end
  def after_sign_in_path_for(resource)
  			if customer_signed_in?
            panelJugador_path(resource)
          else
            panelOwner_path(resource)
        end 
   end

end
