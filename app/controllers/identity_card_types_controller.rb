class IdentityCardTypesController < ApplicationController
  # GET /identity_card_types
  # GET /identity_card_types.json
  def index
    @identity_card_types = IdentityCardType.all

    respond_to do |format|
      format.html # index.html.erb
      format.json { render json: @identity_card_types }
    end
  end

  # GET /identity_card_types/1
  # GET /identity_card_types/1.json
  def show
    @identity_card_type = IdentityCardType.find(params[:id])

    respond_to do |format|
      format.html # show.html.erb
      format.json { render json: @identity_card_type }
    end
  end

  # GET /identity_card_types/new
  # GET /identity_card_types/new.json
  def new
    @identity_card_type = IdentityCardType.new

    respond_to do |format|
      format.html # new.html.erb
      format.json { render json: @identity_card_type }
    end
  end

  # GET /identity_card_types/1/edit
  def edit
    @identity_card_type = IdentityCardType.find(params[:id])
  end

  # POST /identity_card_types
  # POST /identity_card_types.json
  def create
    @identity_card_type = IdentityCardType.new(params[:identity_card_type])

    respond_to do |format|
      if @identity_card_type.save
        format.html { redirect_to @identity_card_type, notice: 'Identity card type was successfully created.' }
        format.json { render json: @identity_card_type, status: :created, location: @identity_card_type }
      else
        format.html { render action: "new" }
        format.json { render json: @identity_card_type.errors, status: :unprocessable_entity }
      end
    end
  end

  # PUT /identity_card_types/1
  # PUT /identity_card_types/1.json
  def update
    @identity_card_type = IdentityCardType.find(params[:id])

    respond_to do |format|
      if @identity_card_type.update_attributes(params[:identity_card_type])
        format.html { redirect_to @identity_card_type, notice: 'Identity card type was successfully updated.' }
        format.json { head :no_content }
      else
        format.html { render action: "edit" }
        format.json { render json: @identity_card_type.errors, status: :unprocessable_entity }
      end
    end
  end

  # DELETE /identity_card_types/1
  # DELETE /identity_card_types/1.json
  def destroy
    @identity_card_type = IdentityCardType.find(params[:id])
    @identity_card_type.destroy

    respond_to do |format|
      format.html { redirect_to identity_card_types_url }
      format.json { head :no_content }
    end
  end
end
